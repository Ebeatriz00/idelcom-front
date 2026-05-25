import { useDetailOpportunities } from "@/sharedKernel";
import { Loader2, X } from "lucide-react";
import type { FileItem } from "../../detail/fileOpp/components/types";
import FileOpporForm from "./filesOpporForm";

type Props = {
  open: boolean;
  linkToken: string;
  onClose: () => void;
  title?: string;
  defaultId?: string;
  rootFolderName?: string;
  onPostDownloadAction?: (file: FileItem) => Promise<void> | void;
};

export function FileExplorerDialog({
  open,
  onClose,
  linkToken,
  title = "Explorador de Archivos",
  defaultId,
  rootFolderName,
  onPostDownloadAction,
}: Props) {
  const { data, isLoading, isError } = useDetailOpportunities(
    String(linkToken)
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />  

      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {data && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {data.opporNumber}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Cerrar"
          >
            <X className="size-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="size-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Cargando gestor de archivos...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <p className="text-red-500 mb-2">Error al cargar datos</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded text-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && data && (
            <div className="h-full">
              <FileOpporForm 
                data={data} 
                defaultId={defaultId}
                rootFolderName={rootFolderName}
                onPostDownloadAction={onPostDownloadAction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}