import type { PersonnelOperationsItem } from "@/application";
import { useState, useMemo } from "react";
import { Panel } from "./presentation/Panel";
import { PersonnelHomologationReplaceDocumentsModal } from "./PersonnelHomologationReplaceDocumentsModal";
import { DocumentManagementSection } from "./DocumentManagementSection";
import type { PersonnelHomologationDocumentItem } from "../../utils/TypesPersonnel";
import { Button } from "@/layouts";
import {
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/sharedKernel/lib/cn";
import { useDeleteSsomaHomologationPersonnelDocument } from "@/sharedKernel";
import Swal from "sweetalert2";

const DOCUMENT_STATUS_OPTIONS = [
  { value: "Vigente", icon: <CheckCircle2 className="size-3" />, color: "text-emerald-600" },
  { value: "Pendiente", icon: <Clock className="size-3" />, color: "text-amber-600" },
  { value: "Vencido", icon: <XCircle className="size-3" />, color: "text-rose-600" },
  { value: "Por vencer", icon: <Clock className="size-3" />, color: "text-orange-600" },
];

export function HomologationFilesPanel({
  generalItems,
  operationItems,
  workerName,
  workerId,
  homologationScopeId,
}: {
  generalItems: PersonnelOperationsItem["personnelHomologationGeneralItems"];
  operationItems: PersonnelOperationsItem["personnelHomologationOperationsItem"];
  workerName?: string;
  workerId?: number;
  homologationScopeId?: number;
}) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [replaceItems, setReplaceItems] = useState<PersonnelHomologationDocumentItem[]>([]);
  const [currentSelectedItems, setCurrentSelectedItems] = useState<PersonnelHomologationDocumentItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { mutateAsync: deleteDocument } = useDeleteSsomaHomologationPersonnelDocument();

  const handleDelete = async (item: PersonnelHomologationDocumentItem) => {
    const docId = Number(item.ssomaHomologationPersonnelDocumentId);
    if (!docId) return;

    const result = await Swal.fire({
      title: "¿Inactivar documento?",
      text: "El requisito pasará a estado Pendiente y deberás subir uno nuevo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await deleteDocument(docId);
    }
  };

  const handleView = (item: PersonnelHomologationDocumentItem) => {
    if (item.fileUid) {
      const VITE_API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, "");
      window.open(`${VITE_API_URL}/api/files/${item.fileUid}?t=${Date.now()}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (!item.fileUrl) return;
    window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleReuse = (item: PersonnelHomologationDocumentItem) => {
    setReplaceItems([item]);
  };

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentSelectedItems.length === 0}
          onClick={() => setReplaceItems(currentSelectedItems)}
          className="h-9 rounded-full border-slate-200 bg-white px-7 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Reemplazar ({currentSelectedItems.length})
        </Button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition-all shadow-sm",
              filterStatus
                ? "border-amber-200 bg-amber-50 text-amber-600"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
            )}
            title="Filtrar por estado"
          >
            <Filter className="h-4 w-4" />
            Filtro
            {filterStatus && (
              <span className="ml-1 size-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5">
                <div className="mb-1 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Filtrar por estado
                  </p>
                </div>

                <div className="space-y-0.5">
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setFilterStatus(filterStatus === opt.value ? "" : opt.value);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-all",
                        filterStatus === opt.value
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <span className={cn("shrink-0", opt.color)}>{opt.icon}</span>
                      {opt.value}
                    </button>
                  ))}
                </div>

                {filterStatus && (
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus("");
                        setShowFilterMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="size-3.5" />
                      Limpiar filtro
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    ),
    [currentSelectedItems, filterStatus, showFilterMenu],
  );

  return (
    <Panel
      title="Gestion de Documentos y Archivos"
      actions={headerActions}
    >
      <DocumentManagementSection
        generalDocuments={generalItems as PersonnelHomologationDocumentItem[]}
        projectDocuments={operationItems as PersonnelHomologationDocumentItem[]}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectedStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onSelectedItemsChange={setCurrentSelectedItems}
        onReplace={setReplaceItems}
        onView={handleView}
        onReuse={handleReuse}
        onDelete={handleDelete}
      />

      <PersonnelHomologationReplaceDocumentsModal
        open={replaceItems.length > 0}
        items={replaceItems}
        workerName={workerName}
        workerId={workerId}
        homologationScopeId={homologationScopeId}
        onClose={() => setReplaceItems([])}
      />
    </Panel>
  );
}
