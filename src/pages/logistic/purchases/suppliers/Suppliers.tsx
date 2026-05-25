import { useMemo, useState } from "react";
import { Building2, CircleAlert, CircleCheck, Plus, RefreshCw, Search } from "lucide-react";

import type { SuppliersResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useSuppliersList,
  useSuppliersMutations,
} from "@/sharedKernel/hooks/logistic/purchases/useSuppliers";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";

import { SuppliersFormModal } from "./components/modal/SuppliersFormModal";
import { SuppliersTable } from "./components/table/SuppliersTable";
import { usePurchasesSuppliersPerms } from "./hooks/suppliers.perms";
import { useSuppliersFormModal } from "./hooks/useSuppliersFormModal";

type StatusFilter = "all" | "active" | "inactive" | "observed";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "observed", label: "Observados" },
];

function getSupplierStatus(row: SuppliersResponseDto): StatusFilter {
  const raw = String(row.status ?? "").trim().toLowerCase();
  if (raw.includes("observ")) return "observed";
  return statusToBool(row.status) ? "active" : "inactive";
}

function filterRows(rows: SuppliersResponseDto[], status: StatusFilter) {
  if (status === "all") return rows;
  return rows.filter((row) => getSupplierStatus(row) === status);
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
  tone: "primary" | "accent" | "muted" | "secondary";
}) {
  const toneClass = {
    primary: "bg-primary-degrad text-primary ring-primary/20",
    accent: "bg-accent/10 text-accent ring-accent/20",
    muted: "bg-muted text-muted-foreground ring-secondary/10",
    secondary: "bg-secondary text-white ring-secondary/20",
  }[tone];

  return (
    <div className="rounded-lg border border-secondary/10 bg-white p-4 shadow-sm transition hover:border-primary/25">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-secondary">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ring-1 ${toneClass}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error, refetch } = useSuppliersList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  );

  const rows: SuppliersResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;
  const filteredRows = useMemo(
    () => filterRows(rows, statusFilter),
    [rows, statusFilter],
  );

  const metrics = useMemo(() => {
    const active = rows.filter((row) => getSupplierStatus(row) === "active").length;
    const observed = rows.filter((row) => getSupplierStatus(row) === "observed").length;
    return {
      total,
      active,
      inactive: rows.length - active - observed,
      observed,
    };
  }, [rows, total]);

  const { statusMut } = useSuppliersMutations();

  const {
    open,
    isFetching: isFetchingDetail,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  } = useSuppliersFormModal();

  const {
    canEditSuppliers,
    canEditStatusSuppliers,
    canExportSuppliers,
  } = usePurchasesSuppliersPerms();

  function onEdit(row: SuppliersResponseDto) {
    if (!canEditSuppliers || row.suppliersId == null) return;
    openEdit(row.suppliersId);
  }

  async function onToggleStatus(row: SuppliersResponseDto) {
    if (!canEditStatusSuppliers || row.suppliersId == null) return;

    const current = statusToBool(row.status);
    const nextLabel = current ? "desactivar" : "activar";
    const confirmed = window.confirm(
      `Confirma que deseas ${nextLabel} al proveedor "${row.supplierName ?? "sin nombre"}".`,
    );
    if (!confirmed) return;

    await statusMut.mutateAsync({
      suppliersId: row.suppliersId,
      businessId: row.businessId,
      status: boolToStatusString(!current),
    });
  }

  function onDelete(_row: SuppliersResponseDto) {}

  return (
    <div className="min-h-[80vh] space-y-5">
      <Breadcrumb
        items={[
          { label: "Logistica", href: "#" },
          { label: "Compras", href: "#" },
          { label: "Proveedores", current: true },
        ]}
      />

      <section className="rounded-lg border border-secondary/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2 text-white">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Compras y abastecimiento
                </p>
                <h1 className="text-2xl font-semibold text-secondary">
                  Proveedores
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              Gestiona proveedores, datos tributarios, ubicacion, condiciones de pago y agentes asociados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-secondary/15 bg-white px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
            >
              <Plus className="size-4" />
              Nuevo proveedor
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total registrados" value={metrics.total} icon={Building2} tone="secondary" />
        <MetricCard label="Activos en pagina" value={metrics.active} icon={CircleCheck} tone="accent" />
        <MetricCard label="Inactivos en pagina" value={metrics.inactive} icon={RefreshCw} tone="muted" />
        <MetricCard label="Observados" value={metrics.observed} icon={CircleAlert} tone="primary" />
      </section>

      <section className="rounded-lg border border-secondary/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, pageIndex: 0 }));
              }}
              placeholder="Buscar por proveedor, RUC, contacto o correo"
              className="w-full rounded-lg border border-secondary/15 bg-background py-2 pl-9 pr-3 text-sm text-secondary outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  statusFilter === option.value
                    ? "bg-secondary text-white"
                    : "border border-secondary/15 bg-white text-secondary hover:border-primary/30 hover:bg-primary-degrad/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={filteredRows.length === 0}
        emptyMessage="No hay proveedores registrados."
      >
        <SuppliersTable
          data={filteredRows}
          total={statusFilter === "all" ? total : filteredRows.length}
          pageCount={statusFilter === "all" ? pageCount : 1}
          pagination={pagination}
          onPaginationChange={setPagination}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          canExportSuppliers={canExportSuppliers}
          canEditSuppliers={canEditSuppliers}
          canEditStatusSuppliers={canEditStatusSuppliers}
          canDeleteSuppliers={false}
          searchValue={search}
          onSearchChange={setSearch}
          loading={isLoading || isFetching || statusMut.isPending}
        />
      </AsyncState>

      <SuppliersFormModal
        open={open}
        title={editingId ? "Editar proveedor" : "Nuevo proveedor"}
        loadingDetail={Boolean(editingId) && isFetchingDetail}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        departmentLabel={defaultValues?.departmentLabel}
        provinceLabel={defaultValues?.provinceLabel}
        districtLabel={defaultValues?.districtLabel}
        typeSuppliersLabel={defaultValues?.typeSuppliersLabel}
        suppliersGroupsLabel={defaultValues?.suppliersGroupsLabel}
        documentTypeLabel={defaultValues?.documentTypeLabel}
        paymentTypeLabel={defaultValues?.paymentTypeLabel}
        paymentMethodLabel={defaultValues?.paymentMethodLabel}
      />
    </div>
  );
}
