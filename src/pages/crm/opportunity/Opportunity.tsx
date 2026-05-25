import type { OpportunitiesResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useOpportunitiesList,
  useOpportunitiesMutations,
} from "@/sharedKernel";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { OpportunityFormModal } from "./components/modal/opportunityFormModal";
import { OpportunityTable } from "./components/table/opportunityTable";
import { useCrmOpporPerms } from "./hooks/oppor.perms";
import { useOpportunitiesFormModal } from "./hooks/useOpportunityModal";
import { parsePagination } from "./utils/helpers";

export default function Opportunity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const opporNumUrl = searchParams.get("opporNum");

  const paramStateId = searchParams.get("stateId");
  const stateId = paramStateId ? Number(paramStateId) : undefined;

  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>(() => {
    const pageIndex = Number(searchParams.get("page") ?? "0");
    const pageSize = Number(searchParams.get("size") ?? "10");
    return { pageIndex, pageSize };
  });

  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  const [filterStartDate, setFilterStartDate] = useState(
    () => searchParams.get("filterStartDate") || "",
  );
  const [filterFinishDate, setFilterFinishDate] = useState(
    () => searchParams.get("filterFinishDate") || "",
  );
  const [filterYear, setFilterYear] = useState(
    () => searchParams.get("year") || "",
  );
  const [workerId, setWorkerId] = useState(
    () => searchParams.get("workerId") || "",
  );

  const [, setVisibleCount] = useState(0);
  const opporNum = searchParams.get("opporNum")?.trim() || "";

  const effectiveSearch = opporNum.length ? opporNum : search;
  const debouncedSearch = useDebouncedValue(effectiveSearch, 400);

  const { data, isLoading, error } = useOpportunitiesList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    stateId,
    filterStartDate ? new Date(filterStartDate) : undefined,
    filterFinishDate ? new Date(filterFinishDate) : undefined,
    filterYear ? Number(filterYear) : undefined,
    workerId ? Number(workerId) : undefined,
  );
  useLayoutEffect(() => {
    const rawPage = searchParams.get("page");
    if (rawPage && !Number.isFinite(Number(rawPage))) {
      const { pageIndex, pageSize } = parsePagination(searchParams);
      const next = new URLSearchParams(searchParams);
      next.set("page", String(pageIndex));
      next.set("size", String(pageSize));

      if (pageIndex === 0) next.delete("page");
      if (pageSize === 10) next.delete("size");

      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");

    if (stateId) next.set("stateId", String(stateId));
    else next.delete("stateId");

    if (opporNumUrl?.trim()) next.set("opporNum", opporNumUrl.trim());
    else next.delete("opporNum");

    if (filterStartDate?.trim())
      next.set("filterStartDate", filterStartDate.trim());
    else next.delete("filterStartDate");

    if (filterFinishDate?.trim())
      next.set("filterFinishDate", filterFinishDate.trim());
    else next.delete("filterFinishDate");

    if (filterYear?.trim()) next.set("year", filterYear.trim());
    else next.delete("year");

    if (workerId?.trim()) next.set("workerId", workerId.trim());
    else next.delete("workerId");

    if (opporNumUrl?.trim()) next.set("opporNum", opporNumUrl.trim());
    else next.delete("opporNum");

    const hasPageParamsAlready =
      searchParams.has("page") || searchParams.has("size");

    if (pagination.pageIndex !== 0 || hasPageParamsAlready)
      next.set("page", String(pagination.pageIndex));
    else next.delete("page");

    if (pagination.pageSize !== 10 || hasPageParamsAlready)
      next.set("size", String(pagination.pageSize));
    else next.delete("size");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    search,
    stateId,
    opporNumUrl,
    filterStartDate,
    filterFinishDate,
    filterYear,
    workerId,
    pagination,
    searchParams,
    setSearchParams,
  ]);

  const { statusMut } = useOpportunitiesMutations();

  const rows: OpportunitiesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const prevFiltersRef = useRef({
    debouncedSearch,
    opporNumUrl,
    stateId,
    filterStartDate,
    filterFinishDate,
    filterYear,
    workerId,
  });

  useEffect(() => {
    const current = {
      debouncedSearch,
      opporNumUrl,
      stateId,
      filterStartDate,
      filterFinishDate,
      filterYear,
      workerId,
    };
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(current)) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      prevFiltersRef.current = current;
    }
  }, [
    debouncedSearch,
    opporNumUrl,
    stateId,
    filterStartDate,
    filterFinishDate,
    filterYear,
    workerId,
  ]);

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  } = useOpportunitiesFormModal();

  const {
    canUseViewComment,
    canCreateOppor,
    canEditOppor,
    canEditStatusOppor,
    canDeleteOppor,
    canExportOppor,
    canApproveViability,
    canCreateOpporManager,
    canUseSellerOption,
  } = useCrmOpporPerms();

  function onEdit(row: OpportunitiesResponseDto) {
    if (!canEditOppor) return;

    const isViability = row.stateGeneral?.toUpperCase() === "VIABILIDAD";
    if (isViability && !canApproveViability) {
      toast.warning(
        "Esta oportunidad está en evaluación de viabilidad. Solo el gerente comercial puede modificar los datos comerciales.",
        {
          position: "top-right",
        },
      );
      return;
    }
    if (!row.linkToken) return;

    openEdit(row.linkToken);
  }

  const isEdit = Boolean(editingId);
  const stateGeneral = (defaultValues as any)?.stateGeneral as
    | string
    | undefined;

  const isProspecto = (stateGeneral ?? "").trim().toUpperCase() === "PROSPECTO";

  // Create siempre Prospecto
  const modalTitle = !isEdit
    ? "Nueva Prospecto"
    : isProspecto
      ? "Editar Prospecto"
      : "Editar Oportunidad";

  async function onToggleStatus(row: OpportunitiesResponseDto) {
    if (!canEditStatusOppor) return;

    const isViability = row.stateGeneral?.toUpperCase() === "VIABILIDAD";
    if (isViability && !canApproveViability) {
      toast.warning(
        "Esta oportunidad está en evaluación de viabilidad. Solo el gerente comercial puede modificar los datos comerciales.",
        {
          position: "top-right",
        },
      );
      return;
    }
    if (!row.linkToken) return;

    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      linkToken: row.linkToken,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: OpportunitiesResponseDto) {
    if (!canDeleteOppor) return;
  }

  const clearFilter = () => {
    setSearch("");
    setFilterStartDate("");
    setFilterFinishDate("");
    setFilterYear("");
    setWorkerId("");
    setSearchParams({});
  };

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Oportunidades de negocio", current: true },
          ]}
          createLabel="Nuevo Prospecto"
          onCreate={canCreateOppor ? openCreate : undefined}
        />

        {stateId && (
          <button
            onClick={clearFilter}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <span className="relative z-10">Filtro: Estado</span>

            <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-red-500">
              <X className="size-3 text-white transition-transform duration-300 group-hover:rotate-90" />
            </span>
          </button>
        )}
        {opporNum && (
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("opporNum");
              setSearchParams(next);
            }}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <span className="relative z-10">
              Filtro: Número de oportunidad ({opporNum})
            </span>
            <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-red-500">
              <X className="size-3 text-white transition-transform duration-300 group-hover:rotate-90" />
            </span>
          </button>
        )}

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay oportunidades registradas."
        >
          <OpportunityTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canUseViewComment={canUseViewComment}
            canEditStatusOppor={canEditStatusOppor}
            canEditOppor={canEditOppor}
            canExportOppor={canExportOppor}
            canUseSellerOption={canUseSellerOption}
            startDate={filterStartDate}
            setStartDate={setFilterStartDate}
            endDate={filterFinishDate}
            setEndDate={setFilterFinishDate}
            year={filterYear}
            setYear={setFilterYear}
            workerId={workerId}
            setWorkerId={setWorkerId}
          />
        </AsyncState>
      </section>
      <OpportunityFormModal
        open={open}
        title={modalTitle}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        clientsLabel={""}
        businessLineLabel={""}
        workerLabel={""}
        currencyLabel={""}
        negotiationStagesLabel={""}
        contactsLabel={""}
        flowTypeLabel={""}
        pmConditionLabel={""}
        canCreateOpporManager={canCreateOpporManager}
      />
    </div>
  );
}
