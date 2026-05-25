import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  showWarning,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import {
  usePreSaleProyectsList,
  usePreSaleProyectsMutations,
  useProjectTeamMutations,
} from "@/sharedKernel/hooks/presale/usePreSaleProyects";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom"; 
import { X } from "lucide-react"; 

import { PreSaleProyectsFormModal } from "./components/PreSaleProyectsFormModal";
import { PreSaleProyectsTable } from "./components/table/PreSaleProyectsTable";
import { usePreSaleProyectsFormModal } from "./hooks/usePreSaleProyectsFormModal";

import { ProjectCollaboratorModal } from "./components/ProjectCollaboratorModal";
import { usePreSaleProyectsPerms } from "./hooks/project.perms";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { PreSaleProjectColumnFilters } from "@/infrastructure/api-clients/presale/preSaleProyects.client";

export default function PreSaleProyects() {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- LÓGICA DE LECTURA DE URL LIMPIA ---
  const opporNumUrl = searchParams.get("opporNum"); 
  const stateId = searchParams.get("stateId");
  const categoryId = searchParams.get("category"); 

  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    return {
      pageIndex: page ? Number(page) - 1 : 0,
      pageSize: pageSize ? Number(pageSize) : 10,
    };
  });

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [startDate, setStartDate] = useState(() => searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") || "");
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    // Leemos parámetros que empiezan con "f_" para reconstruir los filtros de columna
    searchParams.forEach((value, key) => {
      if (key.startsWith("f_")) {
        filters.push({ id: key.replace("f_", ""), value });
      }
    });
    return filters;
  });
  
  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get("sortBy");
    const sortDir = searchParams.get("sortDir");
    return sortBy ? [{ id: sortBy, desc: sortDir === "desc" }] : [];
  });

  const [, setVisibleCount] = useState(0);

  // --- LÓGICA DE ESCRITURA EN URL LIMPIA ---
  useEffect(() => {
    const params = new URLSearchParams();

    // Filtros por parámetros fijos
    if (opporNumUrl) params.set("opporNum", opporNumUrl);
    if (stateId) params.set("stateId", stateId);
    if (categoryId) params.set("category", categoryId); 

    // Paginación plana
    if (pagination.pageIndex !== 0) params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10) params.set("pageSize", pagination.pageSize.toString());
    
    // Búsqueda y fechas
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    // Ordenamiento plano
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortDir", sorting[0].desc ? "desc" : "asc");
    }

    // Filtros de columna planos con prefijo "f_"
    columnFilters.forEach((f) => {
      if (f.value) params.set(`f_${f.id}`, f.value as string);
    });

    // Solo actualizamos si la URL resultante es distinta a la actual
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [pagination, search, startDate, endDate, columnFilters, sorting, opporNumUrl, searchParams, setSearchParams, stateId, categoryId]);


  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortDirection = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const debouncedSearch = useDebouncedValue(search, 300);

  const clearOpporNumFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("opporNum");
    setSearchParams(newParams);
  };

  const apiFilters = useMemo<PreSaleProjectColumnFilters>(() => {
    const filters: any = {};

    if (startDate) filters.filterDateFrom = startDate;
    if (endDate) filters.filterDateTo = endDate;

    columnFilters.forEach((f) => {
      const val = f.value as string;
      if (!val) return;

      switch (f.id) {
        case "opportunityNumber":
          filters.filterCode = val;
          break;
        case "description":
          filters.filterProject = val;
          break;
        case "clientsDescription":
          filters.filterClient = val;
          break;
        case "sellerDescription":
          filters.filterSeller = val;
          break;
        case "responsibleDescription":
          filters.filterResponsible = val;
          break;
        case "statePreSaleDescription":
          filters.filterStatePreSale = val;
          break;
        case "opportunityStateDesc":
          filters.filterStateOpportunity = val;
          break;
        case "finishDate":
          filters.filterFinishDate = val;
          break;
        case "quoDate":
          filters.quoDate = val; 
          break; 
        case "category":
          const searchVal = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if ("estrategico".startsWith(searchVal)) {
            filters.category = 1;
          } 
          else if ("complementario".startsWith(searchVal)) {
            filters.category = 2;
          } 
          else {
            filters.category = -1; 
          }
          break;
      }
    });
    return filters;
  }, [columnFilters, startDate, endDate]); 

  const { data, isLoading, refetch } = usePreSaleProyectsList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    apiFilters,
    undefined, 
    sortBy,       
    sortDirection,
    opporNumUrl || undefined,
    stateId ? Number(stateId) : undefined,
    categoryId ? Number(categoryId) : undefined
  );

  const prevFiltersRef = useRef({
    debouncedSearch,
    columnFilters,
    startDate,
    endDate,
    sorting,
    opporNumUrl,
    stateId,
    categoryId 
  });

  useEffect(() => {
    const currentFilters = {
      debouncedSearch,
      columnFilters,
      startDate,
      endDate,
      sorting,
      opporNumUrl,
      stateId,
      categoryId 
    };

    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      prevFiltersRef.current = currentFilters;
    }
  }, [debouncedSearch, columnFilters, startDate, endDate, sorting, opporNumUrl, stateId, categoryId]);

  const {
    open,
    isFetching,
    defaultValues,
    openEdit,
    close,
    submit,
    saving,
    editingId,
    detail,
  } = usePreSaleProyectsFormModal();

  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [selectedProjectToken, setSelectedProjectToken] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

  const {
    canViewViability,
    canAddCollaborators,
    canUpdateProjectStatus,
    canAddPreSalesResponsible,
  } = usePreSaleProyectsPerms();

  const { statusMut } = usePreSaleProyectsMutations();
  const { createCollaboratorMut } = useProjectTeamMutations();
  const isSavingCollaborator = createCollaboratorMut.isPending;

  const rows: PreSaleProyectsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: PreSaleProyectsResponseDto) {
    if (row.linkToken) openEdit(row.linkToken);
  }

  async function onToggleStatus(row: PreSaleProyectsResponseDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      linkToken: row.linkToken,
      status: boolToStatusString(!current),
    });
  }

  function onAddCollaborators(row: PreSaleProyectsResponseDto) {
    const projectToken = row.linkToken ?? null;
    const businessId = row.businessId ?? null;
    if (projectToken == null || businessId == null) {
      showWarning("Datos incompletos", "El proyecto no tiene un 'ID de Cliente' o 'Token' asignado.");
      return;
    }
    setSelectedProjectToken(projectToken);
    setSelectedBusinessId(businessId);
    setCollaboratorModalOpen(true);
  }

  function closeCollaboratorModal() {
    setCollaboratorModalOpen(false);
    setSelectedProjectToken(null);
    setSelectedBusinessId(null);
  }

  const isCollaboratorModalReady = collaboratorModalOpen && selectedProjectToken != null && selectedBusinessId != null;

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Pre-Venta", href: "#" },
            { label: "Proyectos", current: true },
          ]}
        />

        <div className="flex flex-wrap gap-2">
          {opporNumUrl && (
            <button
              onClick={clearOpporNumFilter}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span className="relative z-10">
                Filtro: Número de oportunidad ({opporNumUrl})
              </span>
              <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-red-500">
                <X className="size-3 text-white transition-transform duration-300 group-hover:rotate-90" />
              </span>
            </button>
          )}

          {stateId && (
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("stateId");
                setSearchParams(next);
              }}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span className="relative z-10">Filtro: Estado</span>
              <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-red-500">
                <X className="size-3 text-white transition-transform duration-300 group-hover:rotate-90" />
              </span>
            </button>
          )}

          {categoryId && (
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("category");
                setSearchParams(next);
              }}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span className="relative z-10">
                Filtro: {categoryId === "1" ? "Estratégicos" : "Complementarios"}
              </span>
              <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-red-500">
                <X className="size-3 text-white transition-transform duration-300 group-hover:rotate-90" />
              </span>
            </button>
          )}
        </div>

        <AsyncState
          isLoading={isLoading}
          error={null} 
          isEmpty={false} 
        >
          <PreSaleProyectsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onAddCollaborators={onAddCollaborators}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            canViewViability={canViewViability}
            canAddCollaborators={canAddCollaborators}
            canUpdateProjectStatus={canUpdateProjectStatus}
            canAddPreSalesResponsible={canAddPreSalesResponsible}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onRefresh={refetch}
            sorting={sorting}
            onSortingChange={setSorting}
            apiFilters={apiFilters}
            opporNum={opporNumUrl || undefined}
            stateId={stateId ? Number(stateId) : undefined}
            categoryId={categoryId ? Number(categoryId) : undefined} 
          />
        </AsyncState>
      </section>

      <PreSaleProyectsFormModal
        open={open}
        title={editingId ? "Editar Proyecto" : "Nuevo Proyecto"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        clientsLabel={detail?.clientsDescription}
        contactsCrmLabel={detail?.contactsCrmDescription}
        responsibleLabel={""}
        supervisorLabel={""}
        ssomaLabel={""}
        tecLeaderLabel={""}
        opportunityLabel={detail?.opportunityDescription}
        statePreSaleLabel={detail?.statePreSaleDescription}
        quotationNumberLabel={detail?.quotationNumberDescription}
        orderNumberLabel={detail?.orderNumberDescription}
      />

      <ProjectCollaboratorModal
        open={isCollaboratorModalReady}
        projectToken={selectedProjectToken}
        businessId={selectedBusinessId}
        onClose={closeCollaboratorModal}
        onSubmit={async (dto) => { await createCollaboratorMut.mutateAsync(dto); }}
        saving={isSavingCollaborator}
      />
    </div>
  );
}