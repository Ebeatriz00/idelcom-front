import { Layers, ListChecks, Search, FileText } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/sharedKernel/lib/cn";
import { InputSea } from "@/layouts";
import { DocumentTable } from "./DocumentTable";
import type { PersonnelHomologationDocumentItem } from "../../utils/TypesPersonnel";
import { getPersonnelHomologationRequirementItemKey } from "../../utils/TypesPersonnel";

type Props = {
  generalDocuments: PersonnelHomologationDocumentItem[];
  projectDocuments: PersonnelHomologationDocumentItem[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onSelectedItemsChange?: (items: PersonnelHomologationDocumentItem[]) => void;
  onReplace: (items: PersonnelHomologationDocumentItem[]) => void;
  onReuse: (item: PersonnelHomologationDocumentItem) => void;
  onView: (item: PersonnelHomologationDocumentItem) => void;
  onDownload?: (item: PersonnelHomologationDocumentItem) => void;
};

const PAGE_SIZE = 8;

function normalizeValue(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function matchesSearch(
  item: PersonnelHomologationDocumentItem,
  search: string,
  filterStatus: string,
  showOperation: boolean,
) {
  const term = normalizeValue(search);
  const statusTerm = normalizeValue(filterStatus);

  const matchesText =
    !term ||
    [
      item.requeriment,
      item.fileName,
      item.validationStatus,
      item.fileExpiration,
      showOperation ? item.operationsName : "",
    ].some((field) => normalizeValue(field).includes(term));

  const matchesStatus =
    !statusTerm || normalizeValue(item.validationStatus) === statusTerm;

  return matchesText && matchesStatus;
}

export function DocumentManagementSection({
  generalDocuments,
  projectDocuments,
  selectedKeys,
  onSelectionChange,
  selectedStatus,
  onStatusChange,
  onSelectedItemsChange,
  onReplace,
  onReuse,
  onView,
  onDownload,
}: Props) {
  const [activeTab, setActiveTab] = useState<"projects" | "general">("projects");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const isProjectsTab = activeTab === "projects";
  const currentItems = isProjectsTab ? projectDocuments : generalDocuments;

  const filteredItems = useMemo(
    () =>
      currentItems.filter((item) =>
        matchesSearch(item, search, selectedStatus, isProjectsTab),
      ),
    [currentItems, isProjectsTab, search, selectedStatus],
  );

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, pageIndex]);

  const selectedItems = useMemo(() => {
    const selected = new Set(selectedKeys);
    return filteredItems.filter((item, index) =>
      selected.has(getPersonnelHomologationRequirementItemKey(item, index)),
    );
  }, [filteredItems, selectedKeys]);

  useEffect(() => {
    onSelectedItemsChange?.(selectedItems);
  }, [onSelectedItemsChange, selectedItems]);

  const handleTabChange = (tab: "projects" | "general") => {
    setActiveTab(tab);
    setPageIndex(0);
    setSearch("");
    onStatusChange("");
    onSelectionChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex h-11 w-full overflow-x-auto rounded-full border border-slate-200/60 bg-slate-100/80 p-1 sm:min-w-[320px] lg:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange("projects")}
            className={cn(
              "inline-flex h-full flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all duration-200 sm:flex-none",
              isProjectsTab
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
            )}
          >
            <Layers className="size-3.5" />
            Proyectos
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("general")}
            className={cn(
              "inline-flex h-full flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all duration-200 sm:flex-none",
              !isProjectsTab
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
            )}
          >
            <ListChecks className="size-4" />
            General
          </button>
        </div>

        <div className="w-full lg:w-auto">
          <div className="relative group w-full">
            <InputSea
              placeholder={
                isProjectsTab
                  ? "Filtrar por operacion o requisito..."
                  : "Buscar requerimiento..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              className="w-full h-11 !rounded-full bg-slate-50 pl-11 pr-4 transition-all hover:border-slate-300 focus:bg-white lg:w-80"
            />
            <Search className="absolute left-4.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>

      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DocumentTable
          documents={paginatedItems}
          showOperation={isProjectsTab}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          onView={onView}
          onReplace={(item) => onReplace([item])}
          onReuse={onReuse}
          onDownload={onDownload}
          emptyTitle={
            search || selectedStatus ? "No se encontraron resultados" : undefined
          }
          emptyDescription={
            search || selectedStatus
              ? "Prueba ajustando los terminos de busqueda o filtros aplicados."
              : undefined
          }
        />
      </div>

      {filteredItems.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            <span>
              Mostrando {pageIndex * PAGE_SIZE + 1}-
              {Math.min((pageIndex + 1) * PAGE_SIZE, filteredItems.length)} de{" "}
              {filteredItems.length} registros
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex <= 0}
            >
              Anterior
            </button>
            <div className="flex items-center px-3 h-8 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              {pageIndex + 1} / {pageCount}
            </div>
            <button
              type="button"
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              disabled={pageIndex + 1 >= pageCount}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
