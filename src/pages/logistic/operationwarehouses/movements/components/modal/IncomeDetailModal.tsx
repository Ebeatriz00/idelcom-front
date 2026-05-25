import { Modal } from "@/layouts";
import {
  ArrowDownToLine,
  Box,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  PackageSearch,
  Printer,
  ReceiptText,
  Timer,
  Warehouse,
  XCircle,
} from "lucide-react";
import type { IncomeDetailModalProps } from "../../types/income.types";
import { dateText, money, numberText } from "../../utils/formatters";

type MovementData = NonNullable<IncomeDetailModalProps["data"]>;
type MovementDetail = MovementData["details"][number];

type StatusView = {
  label: string;
  className: string;
  icon: typeof CheckCircle2;
};

function statusView(status?: string): StatusView {
  const value = String(status ?? "").trim().toLowerCase();

  if (value === "0" || value.includes("anulad") || value.includes("inactiv")) {
    return {
      label: "Anulado",
      className: "bg-red-50 text-red-700 ring-red-200",
      icon: XCircle,
    };
  }

  if (value.includes("pend") || value.includes("observ")) {
    return {
      label: "Pendiente",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      icon: Timer,
    };
  }

  return {
    label: "Activo",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  };
}

function documentText(data?: MovementData) {
  if (!data) return "-";
  return [data.series, data.numberDocument].filter(Boolean).join("-") || "-";
}

function taxAmount(data: MovementData) {
  const amount = Number(data.total ?? 0) - Number(data.subTotal ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function StatusBadge({ status }: { status?: string }) {
  const view = statusView(status);
  const Icon = view.icon;

  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ${view.className}`}
    >
      <Icon className="size-3.5" />
      {view.label}
    </span>
  );
}

function DocumentHeader({ data }: { data?: MovementData }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-200">
          <ArrowDownToLine className="size-4" />
        </div>
        <h2 className="truncate text-lg font-bold text-slate-950">
          Detalle del ingreso
        </h2>
        <StatusBadge status={data?.status} />
      </div>
      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
        Documento operacional de movimiento registrado en almacen.
      </p>
    </div>
  );
}

function HeaderField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: typeof Warehouse;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function ProductMeta({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;

  return (
    <span className="text-xs font-medium text-slate-500">
      <span className="font-bold text-slate-400">{label}</span> {value}
    </span>
  );
}

function ProductLine({ item }: { item: MovementDetail }) {
  const expiration = item.expirationDate ? dateText(item.expirationDate) : "";

  return (
    <article className="group grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md lg:grid-cols-[1fr_360px] lg:items-center">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition group-hover:bg-orange-100">
          <Box className="size-3.5" />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-slate-950">
            {item.productDescription || "Producto sin descripcion"}
          </h4>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <ProductMeta label="Lote" value={item.lotNumber} />
            <ProductMeta label="Serie" value={item.serialNumber} />
            <ProductMeta label="Vence" value={expiration} />
          </div>
          {item.observation?.trim() ? (
            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-500">
              {item.observation}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[auto_auto_1fr_auto_1.2fr] items-center gap-1.5 text-right">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Cant.
          </p>
          <p className="mt-0.5 inline-flex min-w-9 justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
            {numberText(item.quantity)}
          </p>
        </div>
        <span className="pt-4 text-sm font-bold text-slate-300">x</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Costo
          </p>
          <p className="text-xs font-bold text-slate-800">
            {money(item.unitCost)}
          </p>
        </div>
        <span className="pt-4 text-sm font-bold text-slate-300">=</span>
        <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 ring-1 ring-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="text-sm font-bold text-slate-950">
            {money(item.totalCost)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function IncomeDetailModal({
  open,
  data,
  loading,
  onClose,
}: IncomeDetailModalProps) {
  if (!open) return null;

  return (
    <Modal
      title={<DocumentHeader data={data} />}
      size="full"
      onClose={onClose}
      closeOnBackdrop={false}
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-slate-200 bg-white px-5 py-3"
      bodyClassName="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-0"
      footerClassName="sticky bottom-0 z-20 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white/95 px-5 py-2.5 backdrop-blur"
      closeButtonClassName="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      contentClassName="overflow-hidden rounded-2xl border border-white/70 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)]"
      footer={
        <>
          <p className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 md:block">
            Comprobante logistico
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Printer className="size-4" />
              Imprimir PDF
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="size-4" />
              Descargar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </>
      }
    >
      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 size-5 animate-spin" />
          Cargando ingreso...
        </div>
      ) : !data ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-slate-500">
          <PackageSearch className="mb-3 size-12 text-slate-300" />
          <p className="font-bold text-slate-700">No se encontro el ingreso.</p>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1240px] px-5 py-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-slate-950">
                    {data.movementTypeDescription || "Ingreso de almacen"}
                  </p>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
                    INGRESO
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 md:grid-cols-3">
                  <HeaderField
                    label="Proveedor"
                    value={data.supplierName || "Sin proveedor"}
                  />
                  <HeaderField
                    label="Fecha"
                    value={dateText(data.movementDate)}
                    icon={CalendarDays}
                  />
                  <HeaderField
                    label="Documento"
                    value={documentText(data)}
                    icon={ReceiptText}
                  />
                  <HeaderField
                    label="Almacen"
                    value={data.warehouseDescription}
                    icon={Warehouse}
                  />
                  <HeaderField
                    label="Referencia"
                    value={data.referenceDocument}
                    icon={FileText}
                  />
                </div>
              </div>

              <div className="min-w-[260px] rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-3.5 text-left shadow-sm lg:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">
                  Total movimiento
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950">
                  {money(data.total)}
                </p>
                <div className="mt-2 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between gap-4 text-slate-500">
                    <span>Subtotal</span>
                    <span className="min-w-[84px] font-semibold text-slate-700">
                      {money(data.subTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-500">
                    <span>IGV ({numberText(data.igv)}%)</span>
                    <span className="min-w-[84px] font-semibold text-slate-700">
                      {money(taxAmount(data))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {data.observation?.trim() ? (
              <p className="mt-3 max-w-4xl border-l-2 border-slate-200 pl-3 text-xs font-medium text-slate-500">
                {data.observation}
              </p>
            ) : null}
          </section>

          <section className="pt-3.5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Productos ingresados
                </h3>
                <p className="text-[11px] font-medium text-slate-400">
                  Cantidades, costos y totales por linea.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {data.details.length} linea{data.details.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-2">
              {data.details.length ? (
                data.details.map((item) => (
                  <ProductLine
                    key={item.warehouseMovementDetailId}
                    item={item}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                  <PackageSearch className="mx-auto mb-3 size-10 text-slate-300" />
                  <p className="font-bold text-slate-700">
                    No hay productos registrados.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}
