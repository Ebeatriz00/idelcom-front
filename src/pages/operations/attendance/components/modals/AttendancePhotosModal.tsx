import { Modal, ImageViewer } from "@/layouts";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import type { AttendanceMatrixDetailDto } from "@/application";

interface Props {
  detail: AttendanceMatrixDetailDto;
  onClose: () => void;
}

export function AttendancePhotosModal({ detail, onClose }: Props) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const photos = [
    { url: detail.checkInGroupPhotoUid, label: "Ingreso Grupal" },
    { url: detail.checkInPhotoUid, label: "Ingreso Indiv." },
    { url: detail.checkOutGroupPhotoUid, label: "Salida Grupal" },
    { url: detail.checkOutPhotoUid, label: "Salida Indiv." }
  ].filter(p => p.url && p.url.trim() !== "");

  return (
    <>
      <Modal
        onClose={onClose}
        title="Evidencia Fotográfica"
        size="2xl"
      >
        <div className="p-6 bg-white min-h-[300px] border-t">
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Visualizando Evidencias
            </p>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {detail.workerName}
            </h2>
          </div>

          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
              <div className="p-4 rounded-full bg-white shadow-sm text-slate-300 mb-3">
                <ImageIcon className="size-8" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Sin fotos registradas
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Este registro no contiene evidencia fotográfica.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div
                    onClick={() => setActivePhotoIndex(index)}
                    className="aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center cursor-pointer group hover:border-emerald-300 hover:bg-emerald-50 transition-all active:scale-95 relative overflow-hidden"
                  >
                    <img
                      src={photo.url as string}
                      alt={photo.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-center text-slate-500 uppercase">
                    {photo.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ImageViewer
        open={activePhotoIndex !== null}
        images={photos.map(p => p.url as string)}
        initialIndex={activePhotoIndex ?? 0}
        onClose={() => setActivePhotoIndex(null)}
      />
    </>
  );
}
