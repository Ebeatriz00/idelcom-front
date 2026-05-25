import { Modal } from "@/layouts";
import {
  deleteLocalFile,
  ensureFolderLocalPath,
  localFileUrl,
  toRelativePathFromPublic,
  uploadToLocalDrive,
} from "@/sharedKernel";
import {
  useProductFilesList,
  useProductFilesMutations,
} from "@/sharedKernel/hooks/fileproducts/useProductFilles";
import {
  BadgeCheck,
  Eye,
  ImagePlus,
  Images,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  open: boolean;
  onClose: () => void;
  productsId: number;
  productName: string;
};

type PendingImage = {
  url: string;
  name: string;
  size: number;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function uploadProductGalleryImage(file: File, productsId: number) {
  const year = new Date().getFullYear().toString();
  const segments = [year, "PRODUCTS", String(productsId)];

  await ensureFolderLocalPath(segments);

  const uploaded = await uploadToLocalDrive(
    file,
    { segments },
    {
      strategy: "timestamp",
      prefix: "",
      dedup: "hash",
      onDuplicate: "return",
    },
  );

  return localFileUrl(uploaded.relativePath);
}

function ProductGallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="aspect-[4/3] animate-pulse rounded-2xl border border-secondary/10 bg-muted"
        />
      ))}
    </div>
  );
}

export function ProductFilesModal({
  open,
  onClose,
  productsId,
  productName,
}: Props) {
  const { data, isLoading } = useProductFilesList(productsId);
  const { createMut, deleteMut } = useProductFilesMutations();

  const [pendingFiles, setPendingFiles] = useState<PendingImage[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mainImageId, setMainImageId] = useState<number | null>(null);
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const files = data?.items ?? [];
  const imageCount = files.length + pendingFiles.length;
  const hasPending = pendingFiles.length > 0;
  const isUploading = createMut.isPending || uploadingLocal;

  const subtitle = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm text-slate-500">{productName}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-degrad px-2 py-0.5 text-[11px] font-bold text-primary ring-1 ring-primary/15">
          <Images className="size-3" />
          {imageCount} {imageCount === 1 ? "imagen" : "imagenes"}
        </span>
      </div>
    ),
    [imageCount, productName],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setDropError(null);
      setUploadingLocal(true);

      try {
        const uploadedFiles = await Promise.all(
          acceptedFiles.map(async (file) => ({
            url: await uploadProductGalleryImage(file, productsId),
            name: file.name,
            size: file.size,
          })),
        );

        setPendingFiles((prev) => [...prev, ...uploadedFiles]);
      } catch (error) {
        console.error("Error subiendo imagenes del producto:", error);
        setDropError("No se pudieron preparar las imagenes. Intenta nuevamente.");
      } finally {
        setUploadingLocal(false);
      }
    },
    [productsId],
  );

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } =
    useDropzone({
      accept: ACCEPTED_IMAGE_TYPES,
      maxSize: MAX_IMAGE_BYTES,
      multiple: true,
      noClick: false,
      onDrop,
      onDropRejected: (rejections) => {
        const firstError = rejections[0]?.errors[0];

        if (firstError?.code === "file-too-large") {
          setDropError("Cada imagen debe pesar como maximo 5MB.");
          return;
        }

        setDropError("Solo se aceptan imagenes PNG, JPG o WEBP.");
      },
    });

  if (!open) return null;

  const handleRemovePending = async (index: number) => {
    const file = pendingFiles[index];
    const relativePath = toRelativePathFromPublic(file.url);

    if (relativePath) {
      await deleteLocalFile(relativePath);
    }

    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadBatch = () => {
    if (!hasPending) return;

    createMut.mutate(
      {
        productsId,
        files: pendingFiles.map((file) => file.url),
      },
      {
        onSuccess: () => setPendingFiles([]),
      },
    );
  };

  const handleDelete = async (fileId: number) => {
    try {
      setDeletingId(fileId);

      const fileToDelete = files.find(
        (file) => file.fileTrackingProductsId === fileId,
      );

      if (fileToDelete?.fileUrl) {
        const relativePath =
          fileToDelete.relativePath ??
          toRelativePathFromPublic(fileToDelete.fileUrl);

        if (relativePath) {
          await deleteLocalFile(relativePath);
        }
      }

      deleteMut.mutate(
        {
          fileTrackingProductsId: fileId,
          productsId,
        },
        {
          onSettled: () => {
            setDeletingId(null);
            if (mainImageId === fileId) setMainImageId(null);
          },
        },
      );
    } catch (error) {
      console.error("Error al eliminar archivo fisico:", error);
      setDeletingId(null);
    }
  };

  const isBusy = (id: number) => deleteMut.isPending || deletingId === id;

  return (
    <Modal
      title="Galeria de Producto"
      subtitle={subtitle}
      size="full"
      onClose={onClose}
      rootClassName="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      overlayClassName="absolute inset-0 bg-black/40"
      contentClassName="flex h-[90vh] max-h-[90vh] min-h-0 max-w-[min(94vw,72rem)] flex-col overflow-hidden"
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-secondary/10 bg-background px-5 py-4"
      bodyClassName="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-5"
      footerClassName="z-10 flex h-[72px] shrink-0 items-center justify-end gap-2 overflow-hidden border-t border-secondary/10 bg-background px-5 py-3"
      closeButtonClassName="ml-auto rounded-xl border border-secondary/10 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-muted hover:text-secondary"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-secondary/10 bg-white px-4 text-sm font-semibold text-secondary transition hover:bg-muted"
          >
            Cerrar
          </button>
          {hasPending && (
            <button
              type="button"
              onClick={handleUploadBatch}
              disabled={isUploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Subir {pendingFiles.length}{" "}
                  {pendingFiles.length === 1 ? "imagen" : "imagenes"}
                </>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-secondary/10 bg-white p-4 shadow-sm">
          <div
            {...getRootProps()}
            className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition sm:min-h-36 sm:flex-row sm:justify-start sm:text-left ${
              isDragActive
                ? "border-primary bg-primary-degrad/70"
                : "border-secondary/15 bg-slate-50 hover:border-primary/40 hover:bg-primary-degrad/30"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-secondary/10 sm:mr-4">
              {uploadingLocal ? (
                <Loader2 className="size-7 animate-spin" />
              ) : (
                <ImagePlus className="size-7" />
              )}
            </div>
            <div className="mt-3 min-w-0 sm:mt-0">
              <p className="text-base font-bold text-secondary">
                Arrastra imagenes aqui o haz clic para subir
              </p>
              <p className="mt-1 text-sm text-slate-500">
                PNG, JPG, WEBP hasta 5MB. Puedes seleccionar multiples imagenes.
              </p>
              {dropError && (
                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-600/15">
                  {dropError}
                </p>
              )}
            </div>
          </div>
        </section>

        {hasPending && (
          <section className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-secondary">
                  Imagenes pendientes
                </h4>
                <p className="text-sm text-slate-500">
                  Revisa las imagenes antes de registrarlas en la galeria.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUploadBatch}
                disabled={isUploading}
                className="hidden h-9 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70 sm:inline-flex"
              >
                {createMut.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                Subir imagenes
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingFiles.map((file, index) => (
                <div
                  key={`${file.url}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-secondary/10 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-white">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-contain p-3"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      NUEVO
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(index)}
                      className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-xl bg-white/95 text-slate-500 shadow-sm ring-1 ring-secondary/10 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Quitar imagen"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="border-t border-secondary/10 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-secondary">
                      {file.name}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-secondary/10 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-secondary">
                Galeria actual
              </h4>
              <p className="text-sm text-slate-500">
                Imagenes registradas para este producto.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-slate-600">
              {files.length} {files.length === 1 ? "imagen" : "imagenes"}
            </span>
          </div>

          {isLoading ? (
            <ProductGallerySkeleton />
          ) : files.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-secondary/15 bg-slate-50 px-4 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-secondary/10">
                <Images className="size-7" />
              </div>
              <p className="mt-3 text-sm font-bold text-secondary">
                Este producto aun no tiene imagenes
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Sube la primera imagen para que el producto sea mas facil de
                identificar.
              </p>
              <button
                type="button"
                onClick={openFilePicker}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
              >
                <ImagePlus className="size-4" />
                Sube la primera imagen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files.map((file, index) => {
                const fileId = file.fileTrackingProductsId;
                const isMain = mainImageId
                  ? mainImageId === fileId
                  : index === 0;

                return (
                  <div
                    key={fileId}
                    className="group overflow-hidden rounded-2xl border border-secondary/10 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] bg-white">
                      <img
                        src={file.fileUrl}
                        alt={file.fileTitle || "Producto guardado"}
                        className="h-full w-full object-contain p-3"
                      />

                      {isMain && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-600/15">
                          <BadgeCheck className="size-3" />
                          Principal
                        </span>
                      )}

                      <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-end gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              file.fileUrl,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-secondary/10 transition hover:bg-primary-degrad hover:text-primary"
                          title="Ver imagen"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMainImageId(fileId)}
                          className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-secondary/10 transition hover:bg-amber-50 hover:text-amber-700"
                          title="Marcar como principal"
                        >
                          <Star className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(fileId)}
                          disabled={isBusy(fileId)}
                          className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-secondary/10 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Eliminar imagen"
                        >
                          {isBusy(fileId) ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-secondary/10 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-secondary">
                        {file.fileTitle || "Imagen de producto"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Imagen #{index + 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
