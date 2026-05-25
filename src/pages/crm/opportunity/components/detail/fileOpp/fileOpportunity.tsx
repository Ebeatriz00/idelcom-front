import { CardContentDetail } from "@/layouts";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { useOpportunityFolders } from "../../../detail/useOpportunityFolders";
import { FileListActivity } from "./components/fileList";
import { FolderTree } from "./components/folderTree";
import { Pagination } from "./components/pagination";
import type { FileOpportunityProps } from "./components/types";
import { UploadZone } from "./components/uploadZone";
import { useFileOpportunity } from "./components/useFileOpportunity";

type ExtendedProps = FileOpportunityProps & {
  onSuccess?: () => void;
};

export default function FileOpportunity({
  data,
  pageSize = 5,
  onUpload,
  onDelete,
  onDownload,
  title = "Archivos Adjuntos",
  defaultId = "",
  onSuccess,
}: ExtendedProps) {
  const { folders, flatFolders } = useOpportunityFolders();
  const allFiles = data?.filetrackingList ?? [];
  const accessibleFolderKeys = flatFolders.filter((f) => f.canView).map((f) => f.key);
  
  const globalTotal = allFiles.filter((f) => 
    f.archiveType && accessibleFolderKeys.includes(f.archiveType)
  ).length;

  const {
    open,
    setOpen,
    page,
    setPage,
    total,
    dragOver,
    setDragOver,
    busy,
    comment,
    setComment,
    folderKey,
    setFolderKey,
    paginated,
    handleFiles,
    onDrop,
    confirmDelete,
    doDownload,
    openInNewTab,
    uploadProgress,
    uploadLabel,
  } = useFileOpportunity({
    data,
    defaultId,
    pageSize,
    onUpload,
    onDelete,
    onDownload,
    folders,
    onSuccess, 
  });
  
  const inputRef = useRef<HTMLInputElement>(null!);

  const currentFolder = flatFolders.find((f) => f.key === folderKey) ?? null;
  const isGroup = currentFolder?.isGroup === true;

  const canAddInFolder = !!currentFolder && !isGroup && currentFolder.canAdd;

  const effectiveCanDownload =
    !!currentFolder && currentFolder.canView && currentFolder.canDownload;

  const effectiveCanDelete =
    !!currentFolder && currentFolder.canAdd && currentFolder.candDelete;

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group w-full flex items-center justify-between px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 tracking-tight">
            {title}
            <span
              className={`inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 ${
                globalTotal > 0 
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {globalTotal} 
            </span>
          </h2>
          <ChevronDown
            className={`size-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            open
              ? "max-h-[4000px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 border border-gray-100 rounded-lg p-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Carpetas
              </p>
              <FolderTree
                folders={folders}
                selected={folderKey}
                onSelect={setFolderKey}
              />
            </div>

            <div className="md:col-span-3 space-y-4">
              {canAddInFolder && !isGroup && (
                <UploadZone
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                  onDrop={onDrop}
                  canAdd={canAddInFolder}
                  currentFolderLabel={currentFolder?.label}
                  comment={comment}
                  setComment={setComment}
                  busy={busy}
                  inputRef={inputRef}
                  onFiles={handleFiles}
                  uploadProgress={uploadProgress}
                  uploadLabel={uploadLabel}
                />
              )}

              <FileListActivity
                items={paginated}
                onOpen={openInNewTab}
                onDownload={doDownload}
                onDelete={confirmDelete}
                busy={busy}
                total={total}
                canDelete={effectiveCanDelete}
                canDownload={effectiveCanDownload}
              />

              <Pagination
                total={total}
                pageSize={pageSize}
                page={page}
                setPage={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </CardContentDetail>
  );
}