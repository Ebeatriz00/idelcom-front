import { Download, Eye, FileText, Search, RefreshCw, Reply, Layers, Trash2 } from "lucide-react";
import { formatValue } from "../../utils/helper";
import { cn } from "@/sharedKernel/lib/cn";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  getPersonnelHomologationRequirementItemKey,
  type PersonnelHomologationDocumentItem,
} from "../../utils/TypesPersonnel";
import { DocumentStatusBadge } from "./presentation/DocumentStatusBadge";
import { PersonnelHomologationGroupedDocumentsModal } from "./PersonnelHomologationGroupedDocumentsModal";

type Props = {
  documents: PersonnelHomologationDocumentItem[];
  showOperation: boolean;
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  onView: (item: PersonnelHomologationDocumentItem) => void;
  onReplace: (item: PersonnelHomologationDocumentItem) => void;
  onReuse?: (item: PersonnelHomologationDocumentItem) => void;
  onDownload?: (item: PersonnelHomologationDocumentItem) => void;
  onDelete?: (item: PersonnelHomologationDocumentItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

function canReplace(item: PersonnelHomologationDocumentItem) {
  const normalized = (item.validationStatus ?? "").trim().toLowerCase();
  const isReplaceableStatus = normalized !== "pendiente";
  
  const hasDocumentId = Number(item.ssomaHomologationPersonnelDocumentId) > 0;
  const hasCompositeIds =
    Number(item.homologationPersonnelId) > 0 && Number(item.requirementId) > 0;

  return isReplaceableStatus && (hasDocumentId || hasCompositeIds);
}

export function DocumentTable({
  documents,
  showOperation,
  selectedKeys,
  onSelectionChange,
  onView,
  onReplace,
  onReuse,
  onDownload,
  onDelete,
  emptyTitle,
  emptyDescription,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const [modalGroup, setModalGroup] = useState<{title: string, items: PersonnelHomologationDocumentItem[]} | null>(null);

  useEffect(() => {
    setModalGroup(null);
  }, [documents]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(x - startX) > 2) {
      e.preventDefault();
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const groupedDocuments = useMemo(() => {
    const groups: { key: string; items: PersonnelHomologationDocumentItem[] }[] = [];
    if (!documents || documents.length === 0) return groups;

    documents.forEach((item) => {
      // Usamos requeriment (nombre) para asegurar que se agrupan aunque tengan distinto ID en BD
      const reqName = String(item.requeriment || "unknown").trim().toLowerCase();
      const groupKey = showOperation
        ? `${(item as any).operationsId}-${reqName}`
        : reqName;

      const existing = groups.find((g) => g.key === groupKey);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ key: groupKey, items: [item] });
      }
    });

    return groups;
  }, [documents, showOperation]);

  const replaceableKeys = documents
    .map((item, index) => ({
      item,
      key: getPersonnelHomologationRequirementItemKey(item, index),
    }))
    .filter(({ item }) => canReplace(item))
    .map(({ key }) => key);

  const selectedInPage = selectedKeys.filter((key) =>
    replaceableKeys.includes(key),
  );
  const allPageSelected =
    replaceableKeys.length > 0 && selectedInPage.length === replaceableKeys.length;

  const toggleAll = () => {
    if (allPageSelected) {
      onSelectionChange(
        selectedKeys.filter((key) => !replaceableKeys.includes(key)),
      );
      return;
    }
    onSelectionChange(Array.from(new Set([...selectedKeys, ...replaceableKeys])));
  };

  const toggleOne = (key: string) => {
    onSelectionChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((itemKey) => itemKey !== key)
        : [...selectedKeys, key],
    );
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 mb-4">
          <Search className="h-8 w-8 text-slate-300" />
        </div>
        <div className="max-w-sm">
          <h3 className="text-base font-bold text-slate-900">
            {emptyTitle ?? (showOperation ? "Sin requisitos por operación" : "Sin requisitos generales")}
          </h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {emptyDescription ?? "No se han encontrado documentos cargados para esta sección."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        className={cn(
          "w-full overflow-x-auto select-none transition-all",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <table className="min-w-[900px] divide-y divide-slate-200 lg:min-w-full pointer-events-auto">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="w-12 px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  disabled={replaceableKeys.length === 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-colors"
                />
              </th>

              {showOperation && (
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Operación
                </th>
              )}

              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Requerimiento
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
            {groupedDocuments.map((group) => {
              const isGroup = group.items.length > 1;
              const item = group.items[0];

              if (isGroup) {
                // Determine group selection state
                const groupReplaceable = group.items.filter(canReplace);
                const someReplaceable = groupReplaceable.length > 0;
                
                const groupKeys = groupReplaceable.map(it => getPersonnelHomologationRequirementItemKey(it, documents.indexOf(it)));
                const groupSelected = groupKeys.length > 0 && groupKeys.every(k => selectedKeys.includes(k));

                const toggleGroup = () => {
                  if (groupSelected) {
                    onSelectionChange(selectedKeys.filter(k => !groupKeys.includes(k)));
                  } else {
                    onSelectionChange(Array.from(new Set([...selectedKeys, ...groupKeys])));
                  }
                };

                return (
                  <tr
                    key={`group-${group.key}`}
                    className={cn(
                      "group transition-colors duration-150",
                      groupSelected ? "bg-blue-50/30" : "hover:bg-slate-50/30"
                    )}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={groupSelected}
                        disabled={!someReplaceable}
                        onChange={toggleGroup}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-40"
                      />
                    </td>

                    {showOperation && (
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatValue(item.operationsName)}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="text-sm font-bold text-slate-900">
                            {formatValue(item.requeriment)}
                          </div>
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            Múltiples clínicas
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium block text-slate-600">
                        {group.items.length} archivos cargados
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-400 italic">
                        Múltiples
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-tight text-blue-700 shadow-sm"
                      >
                        <Eye className="size-3" />
                        VER DETALLE
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModalGroup({ title: formatValue(item.requeriment), items: group.items })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-all"
                          title="Ver lista de documentos"
                        >
                          <Layers className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              // Normal Row
              const globalIndex = documents.indexOf(item);
              const key = getPersonnelHomologationRequirementItemKey(item, globalIndex);
              const hasFile = Boolean(item.fileUid?.trim() || item.fileUrl?.trim());
              const isReplaceable = canReplace(item);
              const isSelected = selectedKeys.includes(key);
              const canReuse = item.allowInternalReuse === 1;
              const canDelete = hasFile && Number(item.ssomaHomologationPersonnelDocumentId) > 0;

              return (
                <tr
                  key={key}
                  className={cn(
                    "group transition-colors duration-150",
                    isSelected ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isReplaceable}
                      onChange={() => toggleOne(key)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-40"
                    />
                  </td>

                  {showOperation && (
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatValue(item.operationsName)}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-sm font-bold text-slate-900">
                          {formatValue(item.requeriment)}
                        </div>
                        {item.clinicName && (
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            {item.clinicName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-medium block",
                      hasFile ? "text-slate-600" : "text-slate-400 italic"
                    )}>
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

                      {canReuse && (
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

      <PersonnelHomologationGroupedDocumentsModal
        open={Boolean(modalGroup)}
        title={`Documentos de ${modalGroup?.title}`}
        documents={modalGroup?.items || []}
        onClose={() => setModalGroup(null)}
        onView={onView}
        onReplace={onReplace}
        onReuse={onReuse}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </>
  );
}
