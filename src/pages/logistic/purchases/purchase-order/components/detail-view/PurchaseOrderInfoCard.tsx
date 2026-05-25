import {
  Building2,
  CalendarDays,
  CreditCard,
  FileBadge,
  Landmark,
  Package,
  StickyNote,
} from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import {
  detailDate,
  detailValue,
  notRegistered,
} from "./purchaseOrderDetailView.helpers";

function InfoItem({
  label,
  value,
  icon: Icon,
  strong,
}: {
  label: string;
  value?: string | number | null;
  icon?: typeof Building2;
  strong?: boolean;
}) {
  const display = detailValue(value);

  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        {label}
      </div>
      <p
        className={[
          "break-words text-sm",
          display === notRegistered ? "text-slate-400" : "text-slate-800",
          strong ? "font-semibold" : "font-medium",
        ].join(" ")}
      >
        {display}
      </p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  const display = detailValue(value);

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <p
        className={[
          "whitespace-pre-line text-sm leading-6",
          display === notRegistered ? "text-slate-400" : "text-slate-700",
        ].join(" ")}
      >
        {display}
      </p>
    </div>
  );
}

export function PurchaseOrderInfoCard({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-slate-100 p-1.5 text-slate-600">
          <Building2 className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Información general</h2>
          <p className="text-xs text-slate-500">Datos comerciales, logísticos y referencias de la OC.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Datos de proveedor
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <InfoItem label="Proveedor" value={order.supplierName} icon={Building2} strong />
            <InfoItem label="RUC proveedor" value={order.supplierDocumentNumber} icon={FileBadge} />
            <InfoItem label="Nro. cotización proveedor" value={order.supplierQuotationReferenceNumber} icon={StickyNote} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Datos comerciales
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <InfoItem label="Fecha" value={detailDate(order.purchaseOrderDate)} icon={CalendarDays} />
            <InfoItem label="Moneda" value={order.currencyDescription} icon={Landmark} />
            <InfoItem label="Tipo de cambio" value={order.exchangeRate ?? 1} icon={Landmark} />
            <InfoItem label="Condición de pago" value={order.pmConditionDescription} icon={CreditCard} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Datos logísticos
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem label="Fecha de entrega" value={detailDate(order.expectedDeliveryDate)} icon={CalendarDays} />
            <InfoItem label="Almacén" value={order.warehouseDescription} icon={Package} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <TextBlock label="Referencias" value={order.references} />
          <TextBlock label="Observaciones" value={order.observation} />
        </div>
      </div>
    </section>
  );
}

