import { Download, FileText, Trash2 } from "lucide-react";
import type { FileItem } from "./types";

type Props = {
  items: FileItem[];
  onOpen: (url?: string) => void;
  onDownload: (f: FileItem) => Promise<void>;
  onDelete: (linkToken: string) => Promise<void>;
  busy: boolean;
  total: number;
  canDownload?: boolean;
  canDelete?: boolean;
  isGroup?: boolean;
};

export function FileListActivity({
  items,
  onOpen,
  onDownload,
  onDelete,
  busy,
  total,
  canDownload = false,
  canDelete = false,
  isGroup
}: Props) {
  if (total === 0 && !isGroup) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-600">
        <FileText className="size-5" />
        <span className="text-sm">Sin archivos en esta carpeta.</span>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {items.map((f) => (
        <li
          key={f.linkToken}
          className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-50"
        >
          <FileText className="w-5 h-5 text-gray-500 shrink-0" />

          <div className="flex flex-col min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onOpen(f.fileUrl)}
              className="text-sm font-medium text-blue-700 hover:underline text-left break-all"
              title={f.fileTitle || "Archivo sin nombre"}
            >
              {f.fileTitle || "Archivo sin nombre"}
            </button>

            {f.commentFile && (
              <p className="text-xs text-gray-600 mt-0.5 leading-snug break-all">
                {f.commentFile}
              </p>
            )}

            {f.dateUpload && (
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(f.dateUpload).toLocaleDateString("es-PE")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canDownload && (
              <button
                type="button"
                onClick={() => onDownload(f)}
                className="p-1 rounded-md hover:bg-gray-100"
                title="Descargar"
              >
                <Download className="size-4" />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(f.linkToken)}
                className="p-1 rounded-md hover:bg-red-50 text-red-600 disabled:opacity-50"
                title="Eliminar"
                disabled={busy}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
