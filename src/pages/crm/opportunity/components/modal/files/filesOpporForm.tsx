import { CardContentDetail } from "@/layouts";
import { useOpportunityFolders } from "../../../detail/useOpportunityFolders";
import { FileListActivity } from "../../detail/fileOpp/components/fileList";
import { FolderTree } from "../../detail/fileOpp/components/folderTree";
import { Pagination } from "../../detail/fileOpp/components/pagination";
import type {
  FileItem,
  FileOpportunityProps,
} from "../../detail/fileOpp/components/types";
import { UploadZone } from "../../detail/fileOpp/components/uploadZone";
import { useFileOpportunity } from "../../detail/fileOpp/components/useFileOpportunity";

type ExtendedProps = FileOpportunityProps & {
  onPostDownloadAction?: (file: FileItem) => Promise<void> | void;
  rootFolderName?: string;
};

export default function FileOpporForm({
  data,
  pageSize = 5,
  onUpload,
  onDelete,
  onDownload,
  defaultId = "",
  onPostDownloadAction,
  rootFolderName,
}: ExtendedProps) {
  const { folders, flatFolders } = useOpportunityFolders();

  const {
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
    inputRef,
  } = useFileOpportunity({
    data,
    defaultId,
    pageSize,
    onUpload,
    onDelete,
    onDownload,
    folders,
    onPostDownloadAction,
    rootFolderName,
  });

  const safeInputRef = inputRef as React.RefObject<HTMLInputElement>;
  const currentFolder = flatFolders.find((f) => f.key === folderKey) ?? null;
  const isGroup = currentFolder?.isGroup === true;
  const canAddInFolder = !!currentFolder && !isGroup && currentFolder.canAdd;
  const effectiveCanDownload =
    !!currentFolder && currentFolder.canView && currentFolder.canDownload;
  const effectiveCanDelete =
    !!currentFolder && currentFolder.canAdd && currentFolder.candDelete;

  return (
    <CardContentDetail className="p-0 h-full">
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        <div className="md:col-span-1 border border-gray-100 rounded-lg p-3 bg-gray-50 h-full overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 mb-2">Carpetas</p>
          <FolderTree
            folders={folders}
            selected={folderKey}
            onSelect={setFolderKey}
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          {canAddInFolder && !isGroup && (
            <div className="flex-shrink-0">
              <UploadZone
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={onDrop}
                canAdd={canAddInFolder}
                currentFolderLabel={currentFolder?.label}
                comment={comment}
                setComment={setComment}
                busy={busy}
                inputRef={safeInputRef}
                onFiles={handleFiles}
                uploadProgress={uploadProgress}
                uploadLabel={uploadLabel}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-md">
            <FileListActivity
              items={paginated}
              onOpen={openInNewTab}
              onDownload={doDownload}
              onDelete={confirmDelete}
              busy={busy}
              total={total}
              isGroup={isGroup}
              canDelete={effectiveCanDelete}
              canDownload={effectiveCanDownload}
            />
          </div>

          <div className="flex-shrink-0">
            <Pagination
              total={total}
              pageSize={pageSize}
              page={page}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </CardContentDetail>
  );
}
