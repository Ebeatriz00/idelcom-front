import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ChevronLeft, ChevronRight, X,
  Briefcase, Calendar, Clock,
  AlertCircle, FileText, Building2,
  Hash, ArrowRight, Camera,
} from "lucide-react";
import { ImageViewer } from "@/layouts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceDetailModalProps {
  selectedDetail: any;
  onClose: () => void;
  getStatusStyle: (id: number | string) => any;
}

interface Photo {
  url: string;
  label: string;
}

interface GridDetailItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  colSpan?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatLateMinutes = (minutes: number): string =>
  Math.floor(minutes / 60) > 0
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}m`;

const buildPhotos = (detail: any): Photo[] =>
  [
    { url: detail.checkInGroupPhotoUid, label: "Ingreso Grupal" },
    { url: detail.checkInPhotoUid, label: "Ingreso Personal" },
    { url: detail.checkOutGroupPhotoUid, label: "Salida Grupal" },
    { url: detail.checkOutPhotoUid, label: "Salida Personal" },
  ].filter((p): p is Photo => Boolean(p.url?.trim()));

// ─── Sub-components ───────────────────────────────────────────────────────────

const GridDetailItem = ({ label, value, icon: Icon, color, colSpan = "col-span-1" }: GridDetailItemProps) => (
  <div className={`p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100/50 transition-all ${colSpan}`}>
    <div className="flex items-center gap-2.5">
      <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 flex-shrink-0 shadow-sm">
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <span
      className="text-xs font-black text-slate-800 text-right max-w-[200px] leading-tight"
      style={{ color }}
    >
      {value}
    </span>
  </div>
);

const PhotoThumbnail = ({ photo, index, onClick }: { photo: Photo; index: number; onClick: (i: number) => void }) => (
  <button
    key={index}
    onClick={(e) => { e.stopPropagation(); onClick(index); }}
    title={photo.label}
    className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-400 hover:scale-105 active:scale-95 transition-all group bg-zinc-50 flex items-center justify-center flex-shrink-0 shadow-sm"
  >
    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] py-0.5 text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase truncate px-1">
      {photo.label.split(" ")[0]}
    </div>
  </button>
);

const PhotoGallery = ({ photos, onPhotoClick }: { photos: Photo[]; onPhotoClick: (i: number) => void }) => (
  <div className="col-span-2 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col justify-center">
    <div className="flex items-center gap-2.5 mb-3">
      <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 flex-shrink-0 shadow-sm">
        <Camera size={14} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
        Evidencias Fotográficas
      </span>
    </div>
    <div className="flex gap-2 justify-center">
      {photos.map((photo, i) => (
        <PhotoThumbnail key={i} photo={photo} index={i} onClick={onPhotoClick} />
      ))}
    </div>
  </div>
);

const TimeBox = ({ label, time, color }: { label: string; time: string | null; color: string }) => (
  <div className="flex-1 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center min-h-[70px]">
    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">{label}</span>
    <div className="flex items-center gap-2 text-zinc-800 font-mono font-bold text-base">
      <Clock size={14} style={{ color }} />
      {time ? time.substring(11, 16) : "--:--"}
    </div>
  </div>
);

const TimeControl = ({ detail }: { detail: any }) => (
  <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl">
    <div className="flex items-center justify-between gap-4 mb-4">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
        Control de Tiempos
      </span>
      <div className="flex items-center gap-2">
        {detail.isLate && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[9px] font-black uppercase tracking-wider shadow-sm">
            <AlertCircle size={10} />
            <span>Tardanza: {formatLateMinutes(detail.lateMinutes)}</span>
          </div>
        )}
        {detail.earlyExitMinutes > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
            <ArrowRight size={10} />
            <span>Salida Anticipada: {detail.earlyExitMinutes}m</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex items-stretch gap-4">
      <TimeBox label="Ingreso" time={detail.checkInTime} color="#10b981" />
      <div className="flex items-center text-zinc-300">
        <ArrowRight size={16} />
      </div>
      <TimeBox label="Salida" time={detail.checkOutTime} color="#0ea5e9" />
    </div>
  </div>
);

const Observation = ({ text }: { text: string }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-zinc-400">
      <FileText size={12} />
      <span className="text-[10px] font-black uppercase tracking-wider">Observación</span>
    </div>
    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 text-xs text-zinc-600 italic leading-relaxed">
      "{text}"
    </div>
  </div>
);

const NavigationFooter = ({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center justify-between p-4 bg-zinc-50 border-t border-zinc-100">
    <button
      disabled={current === 0}
      onClick={onPrev}
      className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 disabled:opacity-30 transition-all"
    >
      <ChevronLeft size={16} /> Anterior
    </button>
    <span className="text-[10px] font-bold text-zinc-400">
      {current + 1} de {total}
    </span>
    <button
      disabled={current === total - 1}
      onClick={onNext}
      className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 disabled:opacity-30 transition-all"
    >
      Siguiente <ChevronRight size={16} />
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const AttendanceDetailModal = ({ selectedDetail, onClose, getStatusStyle }: AttendanceDetailModalProps) => {
  if (!selectedDetail) return null;

  const details = Array.isArray(selectedDetail) ? selectedDetail : [selectedDetail];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const currentDetail = details[currentIndex];
  const status = getStatusStyle(currentDetail.attendanceStatusId);
  const allPhotos = buildPhotos(currentDetail);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="relative bg-white rounded-2xl w-full max-w-[550px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-zinc-200 animate-in zoom-in-95 duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                {currentDetail.workerName}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                DNI: {currentDetail.workerDocument}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <GridDetailItem
                label="Fecha"
                value={format(parseISO(currentDetail.attendanceDate), "dd/MM/yyyy")}
                icon={Calendar}
              />
              <GridDetailItem
                label="Estado"
                value={status.label}
                icon={Hash}
                color={status.dot}
              />
              <GridDetailItem
                label="Cliente"
                value={currentDetail.clientsName || "Sin Cliente"}
                icon={Building2}
                colSpan="col-span-2"
              />
              <GridDetailItem
                label="Proyecto"
                value={currentDetail.projectName}
                icon={Briefcase}
                colSpan="col-span-2"
              />
              {allPhotos.length > 0 && (
                <PhotoGallery photos={allPhotos} onPhotoClick={setActivePhotoIndex} />
              )}
            </div>

            <TimeControl detail={currentDetail} />

            {currentDetail.observation && (
              <Observation text={currentDetail.observation} />
            )}
          </div>

          {/* Footer nav */}
          {details.length > 1 && (
            <NavigationFooter
              current={currentIndex}
              total={details.length}
              onPrev={() => setCurrentIndex(prev => prev - 1)}
              onNext={() => setCurrentIndex(prev => prev + 1)}
            />
          )}
        </div>
      </div>

      {/* Image viewer */}
      <ImageViewer
        open={activePhotoIndex !== null}
        images={allPhotos.map(p => p.url)}
        initialIndex={activePhotoIndex ?? 0}
        onClose={() => setActivePhotoIndex(null)}
      />
    </>
  );
};