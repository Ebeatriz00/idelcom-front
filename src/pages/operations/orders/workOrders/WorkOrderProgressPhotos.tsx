import { Modal } from "@/layouts";
import { Image as ImageIcon, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOperationsWorkOrderProgressPhotos } from "@/sharedKernel";
import type { OperationsWorkOrderProgressResponseDto } from "@/application";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  progressItem: OperationsWorkOrderProgressResponseDto | null;
}

function resolvePhotoUrl(url: string) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.pathname.startsWith("/api/files/") && /localhost|127\.0\.0\.1/i.test(parsed.hostname)) {
        const filesBase = import.meta.env.VITE_FILES_API_URL || "https://api.idelcom.pe";
        const normalizedFilesBase = filesBase.endsWith("/") ? filesBase : `${filesBase}/`;
        return new URL(parsed.pathname.replace(/^\//, ""), normalizedFilesBase).toString();
      }
    } catch {
      return url;
    }
    return url;
  }

  if (url.startsWith("/api/files/") || url.startsWith("api/files/")) {
    const filesBase = import.meta.env.VITE_FILES_API_URL || "https://api.idelcom.pe";
    const normalizedFilesBase = filesBase.endsWith("/") ? filesBase : `${filesBase}/`;
    const normalizedPath = url.startsWith("/") ? url.slice(1) : url;
    return new URL(normalizedPath, normalizedFilesBase).toString();
  }

  const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
  const normalizedBase = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
  const normalizedPath = url.startsWith("/") ? url.slice(1) : url;
  return new URL(normalizedPath, normalizedBase).toString();
}

export function WorkOrderProgressPhotos({ progressItem }: Props) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [photoPage, setPhotoPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [photoSources, setPhotoSources] = useState<Record<string, string>>({});
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});
  const loadingPhotoUidsRef = useRef(new Set<string>());
  const objectUrlsRef = useRef<string[]>([]);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const clampPan = (nextPan: { x: number; y: number }, nextZoom = zoom) => {
    const viewer = viewerRef.current;
    const image = imageRef.current;

    if (!viewer || !image) {
      return nextPan;
    }

    const viewerRect = viewer.getBoundingClientRect();
    const baseWidth = image.clientWidth || viewerRect.width;
    const baseHeight = image.clientHeight || viewerRect.height;
    const scaledWidth = baseWidth * nextZoom;
    const scaledHeight = baseHeight * nextZoom;
    const maxX = Math.max(0, (scaledWidth - viewerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - viewerRect.height) / 2);

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  };

  const progressId = progressItem?.progressId ?? null;
  const { data: fetchedPhotos, isLoading } = useOperationsWorkOrderProgressPhotos(progressId);
  const photos = fetchedPhotos || [];

  useEffect(() => {
    setPhotoPage(1);
    setActivePhotoIndex(null);
    setPhotoSources({});
    setBrokenPhotos({});
    loadingPhotoUidsRef.current.clear();
    objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    objectUrlsRef.current = [];
  }, [progressId]);

  useEffect(() => {
    return () => {
      loadingPhotoUidsRef.current.clear();
      objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      objectUrlsRef.current = [];
    };
  }, []);

  const PHOTOS_PER_PAGE = 8;
  const totalPhotoPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const paginatedPhotos = useMemo(() => {
    const start = (photoPage - 1) * PHOTOS_PER_PAGE;
    return photos.slice(start, start + PHOTOS_PER_PAGE);
  }, [photoPage, photos]);

  useEffect(() => {
    if (activePhotoIndex !== null) {
      const activeThumb = document.getElementById(`thumb-${activePhotoIndex}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activePhotoIndex]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [activePhotoIndex]);

  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      return;
    }

    setPan((current) => clampPan(current, zoom));
  }, [zoom]);

  const ensurePhotoSource = async (photoUid: string, url: string) => {
    if (!photoUid || loadingPhotoUidsRef.current.has(photoUid) || photoSources[photoUid]) {
      return;
    }

    loadingPhotoUidsRef.current.add(photoUid);

    try {
      const response = await fetch(resolvePhotoUrl(url), {
        credentials: "include",
      });

      if (!response.ok) {
        setBrokenPhotos((prev) => ({ ...prev, [photoUid]: true }));
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.push(objectUrl);
      setPhotoSources((prev) => (prev[photoUid] ? prev : { ...prev, [photoUid]: objectUrl }));
    } catch {
      setBrokenPhotos((prev) => ({ ...prev, [photoUid]: true }));
    } finally {
      loadingPhotoUidsRef.current.delete(photoUid);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;

    e.preventDefault();
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    setPan(
      clampPan({
        x: dragRef.current.originX + deltaX,
        y: dragRef.current.originY + deltaY,
      }),
    );
  };

  const stopDragging = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active && dragRef.current.pointerId === e.pointerId) {
      dragRef.current.active = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (activePhotoIndex === null) {
      return;
    }

    setPan((current) => clampPan(current, zoom));
  }, [activePhotoIndex, zoom]);

  const handleImageLoad = () => {
    setPan((current) => clampPan(current, zoom));
  };

  if (!progressItem || !progressId) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Galería de evidencias
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 py-24">
          <Loader2 className="size-8 animate-spin text-[#0F6E56]" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Cargando Evidencia...
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 py-20">
          <div className="mb-3 rounded-full bg-white p-4 text-slate-300 shadow-sm">
            <ImageIcon className="size-8" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Sin fotos registradas
          </p>
          <p className="mt-1 text-[10px] font-medium text-slate-400">
            Este reporte no contiene evidencia fotográfica.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {paginatedPhotos.map((photo, index) => {
            const globalIndex = (photoPage - 1) * PHOTOS_PER_PAGE + index;
            const resolvedUrl = photoSources[photo.fileUid] ?? resolvePhotoUrl(photo.url);
            const isBroken = brokenPhotos[photo.fileUid];
            const isActive = activePhotoIndex === globalIndex;

            return (
              <button
                key={photo.fileUid || globalIndex}
                id={`thumb-${globalIndex}`}
                type="button"
                onClick={() => setActivePhotoIndex(globalIndex)}
                onMouseEnter={() => {
                  void ensurePhotoSource(photo.fileUid, photo.url);
                }}
                onFocus={() => {
                  void ensurePhotoSource(photo.fileUid, photo.url);
                }}
                className={cn(
                  "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 bg-slate-50 transition-all active:scale-95",
                  isActive
                    ? "border-[#0F6E56] ring-2 ring-emerald-100"
                    : "border-slate-100 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                {!isBroken ? (
                  <img
                    src={resolvedUrl}
                    alt={`Evidencia ${globalIndex + 1}`}
                    onError={() => {
                      void ensurePhotoSource(photo.fileUid, photo.url);
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                    <ImageIcon className="size-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-500/0 transition-colors hover:bg-emerald-500/5" />
              </button>
            );
          })}
        </div>
      )}

      {totalPhotoPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-2">
          <button
            disabled={photoPage === 1}
            onClick={() => setPhotoPage((prev) => prev - 1)}
            className="rounded-xl p-2 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-5 text-slate-600" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPhotoPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPhotoPage(page)}
                className={cn(
                  "size-8 rounded-lg text-[10px] font-black transition-all",
                  photoPage === page
                    ? "bg-[#0F6E56] text-white shadow-lg shadow-emerald-100"
                    : "text-slate-400 hover:bg-white",
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            disabled={photoPage === totalPhotoPages}
            onClick={() => setPhotoPage((prev) => prev + 1)}
            className="rounded-xl p-2 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-5 text-slate-600" />
          </button>
        </div>
      )}

      <Modal
        hidden={activePhotoIndex === null}
        onClose={() => setActivePhotoIndex(null)}
        hideCloseButton
        closeOnBackdrop
        closeOnEsc
        overlayClassName="absolute inset-0 bg-black/90"
        contentClassName="!bg-transparent !shadow-none !ring-0 !rounded-none !overflow-visible w-full max-w-[min(96vw,90rem)]"
        bodyClassName="!p-0 !overflow-hidden !flex-1 !min-h-0 !bg-transparent"
      >
        {activePhotoIndex !== null && photos[activePhotoIndex] ? (
          <div className="relative flex h-[90vh] items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition-all hover:bg-black/70"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
            <div
              ref={viewerRef}
              className={cn(
                "flex w-full items-center justify-center overflow-hidden",
                zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={stopDragging}
              style={{ touchAction: zoom > 1 ? "none" : "auto" }}
            >
              <img
                ref={imageRef}
                src={
                  photoSources[photos[activePhotoIndex].fileUid] ??
                  resolvePhotoUrl(photos[activePhotoIndex].url)
                }
                alt={`Evidencia ${activePhotoIndex + 1}`}
                className="max-h-[82vh] max-w-[92vw] select-none object-contain shadow-2xl transition-transform duration-150"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                draggable={false}
                onLoad={handleImageLoad}
                onWheel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const step = e.deltaY > 0 ? -0.12 : 0.12;
                  setZoom((prev) => {
                    const next = +(prev + step).toFixed(2);
                    return Math.min(3, Math.max(1, next));
                  });
                }}
                onDoubleClick={() => {
                  setZoom((prev) => (prev > 1 ? 1 : 2));
                }}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePhotoIndex((prev) => {
                  if (prev === null) return prev;
                  return Math.max(0, prev - 1);
                })
              }
              disabled={activePhotoIndex === 0}
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={() =>
                setActivePhotoIndex((prev) => {
                  if (prev === null) return prev;
                  return Math.min(photos.length - 1, prev + 1);
                })
              }
              disabled={activePhotoIndex === photos.length - 1}
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Siguiente foto"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
