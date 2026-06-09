import { Modal, useModalHistoryLock } from "@/layouts";
import { cn } from "@/sharedKernel/lib/cn";
import { Download, Eye, FileText, RefreshCw, Reply, Trash2 } from "lucide-react";
import { formatValue } from "../../utils/helper";
import type { PersonnelHomologationDocumentItem } from "../../utils/TypesPersonnel";
import { DocumentStatusBadge } from "./presentation/DocumentStatusBadge";

type Props = {
  open: boolean;
  title: string;
  documents: PersonnelHomologationDocumentItem[];
  onClose: () => void;
  onView: (item: PersonnelHomologationDocumentItem) => void;
  onReplace: (item: PersonnelHomologationDocumentItem) => void;
  onReuse?: (item: PersonnelHomologationDocumentItem) => void;
  onDownload?: (item: PersonnelHomologationDocumentItem) => void;
  onDelete?: (item: PersonnelHomologationDocumentItem) => void;
};

function canReplace(item: PersonnelHomologationDocumentItem) {
  const normalized = (item.validationStatus ?? "").trim().toLowerCase();
  const isReplaceableStatus = normalized !== "pendiente";

  const hasDocumentId = Number(item.ssomaHomologationPersonnelDocumentId) > 0;
  const hasCompositeIds =
    Number(item.homologationPersonnelId) > 0 && Number(item.requirementId) > 0;

  return isReplaceableStatus && (hasDocumentId || hasCompositeIds);
}

export function PersonnelHomologationGroupedDocumentsModal({
  open,
  title,
  documents,
  onClose,
  onView,
  onReplace,
  onReuse,
  onDownload,
  onDelete,
}: Props) {
  useModalHistoryLock(open, onClose);

  if (!open) return null;

  return (
    <Modal
      onClose={onClose}
      title={title}
      size="3xl"
      contentClassName="max-h-[85vh] overflow-hidden flex flex-col"
    >
      <div className="w-full overflow-x-auto select-none">
        <table className="min-w-[700px] divide-y divide-slate-200 lg:min-w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Clínica
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Archivo
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Vencimiento
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Estado
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {documents.map((item, index) => {
              const hasFile = Boolean(item.fileUid?.trim() || item.fileUrl?.trim());
              const isReplaceable = canReplace(item);
              const canReuseItem = item.allowInternalReuse === 1;
              const canDelete = hasFile && Number(item.ssomaHomologationPersonnelDocumentId) > 0;

              return (
                <tr
                  key={`${item.requirementId}-${index}`}
                  className="group transition-colors duration-150 hover:bg-slate-50/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col justify-center min-h-[32px]">
                        <div className="text-sm font-bold text-slate-900">
                          {formatValue(item.clinicName || "Generales / Sin Clínica")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-sm font-medium block",
                        hasFile ? "text-slate-600" : "text-slate-400 italic"
                      )}
                    >
                      {hasFile ? formatValue(item.fileName) : "Sin archivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-600">
                      {formatValue(item.fileExpiration)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DocumentStatusBadge status={item.validationStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        disabled={!hasFile}
                        onClick={() => onView(item)}
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                          hasFile
                            ? "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 shadow-sm"
                            : "border-slate-100 bg-slate-50 text-slate-300"
                        )}
                        title="Ver archivo"
                      >
                        <Eye className="size-4" />
                      </button>

                      <button
                        type="button"
                        disabled={!isReplaceable}
                        onClick={() => onReplace(item)}
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                          isReplaceable
                            ? "border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 shadow-sm"
                            : "border-slate-100 bg-slate-50 text-slate-300"
                        )}
                        title="Subir/Reemplazar"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>

                      {onDelete && (
                        <button
                          type="button"
                          disabled={!canDelete}
                          onClick={() => onDelete(item)}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                            canDelete
                              ? "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 shadow-sm"
                              : "border-slate-100 bg-slate-50 text-slate-300"
                          )}
                          title="Inactivar/Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}

                      {canReuseItem && (
                        <button
                          type="button"
                          onClick={() => onReuse?.(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm transition-all"
                          title="Reutilizar documento interno"
                        >
                          <Reply className="size-4 -scale-x-100" />
                        </button>
                      )}

                      {onDownload && (
                        <button
                          type="button"
                          disabled={!hasFile}
                          onClick={() => onDownload(item)}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                            hasFile
                              ? "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
                              : "border-slate-100 bg-slate-50 text-slate-300"
                          )}
                          title="Descargar"
                        >
                          <Download className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
