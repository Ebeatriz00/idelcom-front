import { Modal, ImageViewer } from "@/layouts";
import { Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOperationsWorkOrderProgressPhotos } from "@/sharedKernel";
import type { OperationsWorkOrderProgressResponseDto } from "@/application";


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  progressItem: OperationsWorkOrderProgressResponseDto | null;
  onClose: () => void;
}

export function WorkOrderProgressPhotos({ progressItem, onClose }: Props) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [photoPage, setPhotoPage] = useState(1);

  const progressId = progressItem?.progressId ?? null;
  const { data: fetchedPhotos, isLoading } = useOperationsWorkOrderProgressPhotos(progressId);
  const photos = fetchedPhotos || [];

  useEffect(() => {
    setPhotoPage(1);
    setActivePhotoIndex(null);
  }, [progressId]);

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
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activePhotoIndex]);

  if (!progressItem || !progressId) return null;

  return (
    <>
      <Modal
        onClose={onClose}
        title="Evidencia Fotográfica"
        size="2xl"
      >
        <div className="p-6 bg-white min-h-[400px] border-t">
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Visualizando Reporte
            </p>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {progressItem.activityName || "Actividad sin nombre"}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
              <Loader2 className="size-8 animate-spin text-[#0F6E56]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargando Evidencia...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
              <div className="p-4 rounded-full bg-white shadow-sm text-slate-300 mb-3">
                <ImageIcon className="size-8" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Sin fotos registradas
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Este reporte no contiene evidencia fotográfica.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedPhotos.map((photo, index) => {
                const globalIndex = (photoPage - 1) * PHOTOS_PER_PAGE + index;
                return (
                  <div
                    key={photo.fileUid || globalIndex}
                    onClick={() => setActivePhotoIndex(globalIndex)}
                    className="aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center cursor-pointer group hover:border-emerald-300 hover:bg-emerald-50 transition-all active:scale-95 relative overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={`Evidencia ${globalIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                  </div>
                );
              })}
            </div>
          )}

          {totalPhotoPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <button
                disabled={photoPage === 1}
                onClick={() => setPhotoPage(prev => prev - 1)}
                className="p-2 rounded-xl hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="size-5 text-slate-600" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPhotoPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPhotoPage(page)}
                    className={cn(
                      "size-8 rounded-lg text-[10px] font-black transition-all",
                      photoPage === page ? "bg-[#0F6E56] text-white shadow-lg shadow-emerald-100" : "text-slate-400 hover:bg-white"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                disabled={photoPage === totalPhotoPages}
                onClick={() => setPhotoPage(prev => prev + 1)}
                className="p-2 rounded-xl hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="size-5 text-slate-600" />
              </button>
            </div>
          )}

        </div>
      </Modal>

      <ImageViewer
        open={activePhotoIndex !== null}
        images={photos.map(p => p.url)}
        initialIndex={activePhotoIndex ?? 0}
        onClose={() => setActivePhotoIndex(null)}
      />
    </>
  );
}
