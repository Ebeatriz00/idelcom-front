import type {
  FileTrackingOpporCreateDto,
  OpportunitiesDetailDto,
} from "@/application";
import {
  ALLOWED_EXTENSIONS,
  confirmAction,
  deleteLocalFile,
  MAX_SIZE_MB,
  showWarning,
  localFileUrl,
  toRelativePathFromPublic,
  uploadByArchiveType,
  useFTOpportunitiesMutations,
  validateFiles,
} from "@/sharedKernel";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FolderNode } from "./folderTree";
import type { FileItem } from "./types";

type Params = {
  data: OpportunitiesDetailDto | null;
  defaultId?: string;
  pageSize: number;
  onUpload?: (files: File[]) => Promise<void> | void;
  onDelete?: (linkToken: string) => Promise<void> | void;
  onDownload?: (file: FileItem) => Promise<void> | void;
  folders: FolderNode[];
  canDelete?: boolean;
  canDownload?: boolean;
  onSuccess?: () => void;
  rootFolderName?: string;
  onPostDownloadAction?: (file: FileItem) => Promise<void> | void;
};

export function useFileOpportunity({
  data,
  defaultId = "",
  pageSize,
  onUpload,
  onDelete,
  onDownload,
  folders,
  canDelete = true,
  canDownload = true,
  onSuccess,
  rootFolderName = "OPORTUNIDADES",
  onPostDownloadAction,
}: Params) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);

  const [folderKey, setFolderKey] = useState<string | null>(() => {
    const first = folders.find((f) => f.canView) ?? folders[0];
    return first ? first.key : null;
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { createFTMut, delelteFTMut } = useFTOpportunitiesMutations();

  const allFiles = data?.filetrackingList ?? [];

  const filteredFiles = useMemo(() => {
    if (!folderKey) return allFiles;
    return allFiles.filter((x) => x.archiveType === folderKey);
  }, [allFiles, folderKey]);

  const total = filteredFiles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filteredFiles.slice(start, start + pageSize);
  }, [filteredFiles, pageSafe, pageSize]);

  const getSafeUrl = (rawUrl?: string) => {
    if (!rawUrl) return "";
    let url = rawUrl.trim();
    url = url.replace(/\\/g, "/");
    try {
      url = decodeURI(url);
    } catch {}
    return encodeURI(url);
  };

  const doInternalUpload = useCallback(
    async (selected: File[]) => {
      const opporNumber = String(data?.opporNumber || defaultId || "").trim();
      const opporToken = String(data?.linkToken || "").trim();

      if (!opporToken) {
        alert("Falta el token de seguridad.");
        return;
      }
      if (!folderKey) {
        alert("Selecciona la carpeta destino.");
        return;
      }

      const year = String(new Date().getFullYear());
      const baseSegments: string[] = [year, rootFolderName];

      const parentFolder = folders.find((parent) =>
        parent.children?.some((child) => child.key === folderKey)
      );

      const storageFolderPath = parentFolder
        ? `${parentFolder.key}/${folderKey}`
        : folderKey;

      setBusy(true);
      try {
        const totalFiles = selected.length;

        for (let i = 0; i < totalFiles; i++) {
          const f = selected[i];

          setUploadLabel(`Subiendo ${i + 1} de ${totalFiles}: ${f.name}`);
          setUploadProgress(0);

          const up = await uploadByArchiveType(f, opporNumber, storageFolderPath, {
            strategy: "same",
            baseSegments,
            onProgress: (percent) => {
              setUploadProgress(percent);
            },
          });

          const payload: FileTrackingOpporCreateDto = {
            opporToken,
            fileTitle: up.fileName,
            fileUrl: localFileUrl(up.relativePath),
            relativePath: up.relativePath,
            comment: comment || "",
            archiveType: folderKey,
            projectToken: opporToken,
          } as any;

          await createFTMut.mutateAsync(payload);
        }

        setComment("");
        if (onSuccess) onSuccess();
      } finally {
        setUploadProgress(null);
        setUploadLabel(null);
        setBusy(false);
      }
    },
    [
      data?.opporNumber,
      data?.linkToken,
      defaultId,
      folderKey,
      comment,
      createFTMut,
      onSuccess,
      rootFolderName,
      folders,
    ]
  );

  const handleFiles = useCallback(
    async (list: FileList | null) => {
      if (!list || list.length === 0 || busy) return;
      setBusy(true);
      try {
        const arr = Array.from(list).map((f) => 
        new File([f], f.name.normalize("NFC"), {
          type: f.type,
          lastModified: f.lastModified,
        })
      );
        const { valid, rejected } = validateFiles(
          arr,
          ALLOWED_EXTENSIONS,
          MAX_SIZE_MB
        );

        if (rejected.length) {
          const msg = rejected
            .slice(0, 5)
            .map((r) => `• ${r.file.name}: ${r.reason}`)
            .join("\n");
          await showWarning(
            "Archivo(s) no permitido(s)",
            `Se rechazaron:\n${msg}${
              rejected.length > 5 ? `\n…y ${rejected.length - 5} más.` : ""
            }`
          );
          return;
        }

        if (valid.length === 0) return;
        if (onUpload) await onUpload(valid);
        else await doInternalUpload(valid);

        setPage(1);
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onUpload, doInternalUpload, busy]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      await handleFiles(e.dataTransfer?.files ?? null);
    },
    [handleFiles]
  );

  const confirmDelete = useCallback(
    async (linkToken: string) => {
      if (!canDelete) return;

      const ok = await confirmAction({
        title: "¿Desea eliminar el archivo?",
        text: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar",
        icon: "warning",
      });
      if (!ok) return;

      setBusy(true);
      try {
        const item = allFiles.find(
          (x) => String(x.linkToken) === String(linkToken)
        );

        if (item?.relativePath) {
          const rel = toRelativePathFromPublic(item.relativePath);
          if (rel) {
            try {
              await deleteLocalFile(rel);
            } catch (e) {
              console.warn("No se pudo borrar del storage:", e);
            }
          }
        }

        if (onDelete) {
          await onDelete(linkToken);
        } else {
          await delelteFTMut.mutateAsync({
            opporToken: String(data?.linkToken ?? ""),
            linkToken: String(linkToken),
            projectToken: String(data?.linkToken ?? ""),
          } as any);
        }

        if (onSuccess) onSuccess();
      } finally {
        setBusy(false);
      }
    },
    [canDelete, allFiles, data?.linkToken, onDelete, delelteFTMut, onSuccess]
  );

  const openInNewTab = useCallback(
    (fileOrUrl: FileItem | string | undefined) => {
      if (!fileOrUrl) return;

      let urlToOpen = "";
      let item: FileItem | null = null;

      if (typeof fileOrUrl === "string") {
        urlToOpen = fileOrUrl;
        item = allFiles.find((f) => f.fileUrl === fileOrUrl) ?? null;
      } else {
        item = fileOrUrl;
        urlToOpen = fileOrUrl.fileUrl || "";
      }

      if (!urlToOpen) return;

      const url = getSafeUrl(urlToOpen);
      window.open(url, "_blank", "noopener,noreferrer");

      if (onPostDownloadAction && item) {
        onPostDownloadAction(item);
      }
    },
    [allFiles, onPostDownloadAction]
  );

  const doDownload = useCallback(
    async (f: FileItem) => {
      if (!canDownload) {
        alert("No tienes permiso para descargar archivos.");
        return;
      }

      if (onDownload) {
        await onDownload(f);
        if (onPostDownloadAction) onPostDownloadAction(f);
      } else {
        const url = getSafeUrl(f.fileUrl);

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = f.commentFile || f.fileTitle || "archivo";

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          a.remove();
        }, 100);

        if (onPostDownloadAction) {
          onPostDownloadAction(f);
        }
      }
    },
    [onDownload, canDownload, onPostDownloadAction]
  );

  return {
    open,
    setOpen,
    page,
    setPage,
    pageSafe,
    total,
    totalPages,
    dragOver,
    setDragOver,
    busy,
    comment,
    uploadProgress,
    uploadLabel,
    setComment,
    folderKey,
    setFolderKey,
    inputRef,
    paginated,
    handleFiles,
    onDrop,
    confirmDelete,
    doDownload,
    openInNewTab,
  };
}
