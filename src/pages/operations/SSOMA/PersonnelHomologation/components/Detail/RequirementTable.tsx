import { Download, Eye, FileText, AlertCircle, CheckCircle2, Clock, XCircle, Search, RefreshCw } from "lucide-react";
import { formatValue } from "../../utils/helper";
import { cn } from "@/sharedKernel/lib/cn";
import { useRef, useState } from "react";
import { downloadLocalFile, toRelativePathFromPublic } from "@/sharedKernel";
import {
  getPersonnelHomologationRequirementItemKey,
  type PersonnelHomologationRequirementItem,
} from "../../utils/TypesPersonnel";

type RequirementBase = PersonnelHomologationRequirementItem;
type RequirementOperation = RequirementBase & { operationsName: string };

function hasReplaceableStatus(status?: string) {
  const normalized = (status ?? "").trim().toLowerCase();
  return normalized === "vencido" || normalized === "por vencer";
}

function canReplace(item: PersonnelHomologationRequirementItem) {
  const hasDocumentId = Number(item.ssomaHomologationPersonnelDocumentId) > 0;
  const hasCompositeIds =
    Number(item.homologationPersonnelId) > 0 && Number(item.requirementId) > 0;

  return hasReplaceableStatus(item.validationStatus) && (hasDocumentId || hasCompositeIds);
}

function getStatusConfig(status?: string) {
  const normalized = (status ?? "").trim().toLowerCase();

  if (normalized === "vigente") {
    return {
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  }

  if (normalized === "pendiente" || normalized === "por vencer") {
    return {
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: <Clock className="h-3 w-3" />,
    };
  }

  if (
    normalized === "observado" ||
    normalized === "vencido" ||
    normalized === "faltante"
  ) {
    return {
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: <XCircle className="h-3 w-3" />,
    };
  }

  return {
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <AlertCircle className="h-3 w-3" />,
  };
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function resolveDownloadName(url: string, fileName?: string) {
  const fallbackName = url.split(/[\\/]/).pop()?.split("?")[0] || "archivo";
  const name = fileName?.trim() || fallbackName;

  if (name.includes(".")) return name;
  if (/\.pdf(?:$|[?#])/i.test(url)) return `${name}.pdf`;

  return name;
}

function EmptyRequirementsState({
  showOperation,
  title,
  description,
}: {
  showOperation: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center bg-slate-50/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 mb-4">
        <Search className="h-8 w-8 text-slate-300" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-base font-bold text-slate-900">
          {title ??
            (showOperation
              ? "Sin requisitos por operación"
              : "Sin requisitos generales")}
        </h3>

        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {description ??
            (showOperation
              ? "Actualmente no hay requisitos de operación asignados a este registro de homologación."
              : "No se han encontrado requisitos generales configurados para este perfil.")}
        </p>
      </div>
    </div>
  );
}

export function RequirementTable({
  items,
  showOperation,
  emptyTitle,
  emptyDescription,
  selectedKeys = [],
  onSelectionChange,
  onReplaceOne,
}: {
  items: PersonnelHomologationRequirementItem[];
  showOperation: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onReplaceOne?: (item: PersonnelHomologationRequirementItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    
    // Solo scrollear si hay movimiento real para no bloquear eventos accidentales
    if (Math.abs(x - startX) > 2) {
      e.preventDefault();
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleView = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (url?: string, fileName?: string) => {
    if (!url) return;
    const downloadName = resolveDownloadName(url, fileName);

    try {
      const relativePath = toRelativePathFromPublic(url);

      if (relativePath && !isExternalUrl(relativePath)) {
        await downloadLocalFile(relativePath, downloadName);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Error al descargar via blob, usando fallback:", error);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 100);
    }
  };

  const replaceableKeys = items
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
    if (!onSelectionChange) return;
    if (allPageSelected) {
      onSelectionChange(
        selectedKeys.filter((key) => !replaceableKeys.includes(key)),
      );
      return;
    }

    onSelectionChange(Array.from(new Set([...selectedKeys, ...replaceableKeys])));
  };

  const toggleOne = (key: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((itemKey) => itemKey !== key)
        : [...selectedKeys, key],
    );
  };
  
  if (!items || items.length === 0) {
    return (
      <EmptyRequirementsState
        showOperation={showOperation}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div 
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={cn(
        "w-full overflow-x-auto select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      <table className="min-w-[860px] divide-y divide-slate-200 lg:min-w-full pointer-events-auto">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="w-12 px-4 py-4 text-left">
              <input
                type="checkbox"
                checked={allPageSelected}
                disabled={replaceableKeys.length === 0}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                aria-label="Seleccionar documentos"
              />
            </th>

            {showOperation && (
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Operación
              </th>
            )}

            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              Requerimiento
            </th>

            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              Archivo
            </th>

            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              Estado
            </th>

            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              Vigencia
            </th>

            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              Revisión
            </th>

            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item, index) => {
            const operationItem = item as RequirementOperation;
            const hasFile = Boolean(item.fileUrl?.trim());
            const statusConfig = getStatusConfig(item.validationStatus);
            const key = getPersonnelHomologationRequirementItemKey(item, index);
            const isReplaceable = canReplace(item);
            const isSelected = selectedKeys.includes(key);

            return (
              <tr
                key={key}
                className="group transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isReplaceable}
                    onChange={() => toggleOne(key)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Seleccionar ${formatValue(item.requeriment)}`}
                  />
                </td>

                {showOperation && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700">
                      {formatValue(operationItem.operationsName)}
                    </span>
                  </td>
                )}

                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 line-clamp-2">
                        {formatValue(item.requeriment)}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={cn(
                      "text-sm font-medium truncate max-w-[200px]",
                      hasFile ? "text-slate-600" : "text-slate-400 italic"
                    )}>
                      {hasFile ? formatValue(item.fileName) : "Sin archivo adjunto"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all shadow-sm",
                      statusConfig.className
                    )}
                  >
                    {statusConfig.icon}
                    {formatValue(item.validationStatus)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatValue(item.fileExpiration)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                  {formatValue(item.fileReview)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={!hasFile}
                      onClick={() => handleView(item.fileUrl)}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
                        hasFile
                          ? "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow"
                          : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                      )}
                      title="Previsualizar documento"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>

                    <button
                      type="button"
                      disabled={!hasFile}
                      onClick={() => handleDownload(item.fileUrl, item.fileName)}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
                        hasFile
                          ? "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow"
                          : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                      )}
                      title="Descargar documento"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>

                    <button
                      type="button"
                      disabled={!isReplaceable}
                      onClick={() => onReplaceOne?.(item)}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
                        isReplaceable
                          ? "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:shadow"
                          : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                      )}
                      title="Reemplazar documento"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
