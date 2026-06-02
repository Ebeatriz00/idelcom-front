import { useEffect, useState, type ElementType } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Hash,
  User,
  Users,
  X,
} from "lucide-react";
import { ImageViewer } from "@/layouts";

interface AttendanceDetailModalProps {
  selectedDetail: any;
  onClose: () => void;
  getStatusStyle: (id: number | string) => any;
}

interface Photo {
  url: string;
  label: string;
  group: "group" | "individual";
}

interface GridDetailItemProps {
  label: string;
  value: string;
  icon: ElementType;
  color?: string;
  colSpan?: string;
}

const formatLateMinutes = (minutes: number): string =>
  Math.floor(minutes / 60) > 0
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}m`;

const buildPhotos = (detail: any): Photo[] =>
  [
    { url: detail.checkInGroupPhotoUid, label: "Ingreso Grupal", group: "group" },
    { url: detail.checkOutGroupPhotoUid, label: "Salida Grupal", group: "group" },
    { url: detail.checkInPhotoUid, label: "Ingreso Individual", group: "individual" },
    { url: detail.checkOutPhotoUid, label: "Salida Individual", group: "individual" },
  ].filter((p): p is Photo => Boolean(p.url?.trim()));

const isBiometricAttendance = (detail: any): boolean => {
  const source = String(
    detail.attendanceSource ??
      detail.source ??
      detail.sourceType ??
      detail.markingSource ??
      detail.registrationSource ??
      ""
  ).toLowerCase();

  return Boolean(
    detail.isBiometric ||
      detail.isFingerprint ||
      detail.fromBiometric ||
      detail.fromFingerprint ||
      detail.isDeviceAttendance ||
      source.includes("huell") ||
      source.includes("biometric") ||
      source.includes("finger")
  );
};

const GridDetailItem = ({ label, value, icon: Icon, color, colSpan = "" }: GridDetailItemProps) => (
  <div className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-slate-50 p-3 transition-all hover:bg-slate-100/50 sm:p-3.5 ${colSpan}`}>
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm">
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
    </div>
    <span
      className="min-w-0 max-w-[55%] break-words text-right text-xs font-black leading-tight text-slate-800"
      style={{ color }}
    >
      {value}
    </span>
  </div>
);

const PhotoThumbnail = ({ photo, index, onClick }: { photo: Photo; index: number; onClick: (i: number) => void }) => (
  <button
    key={index}
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick(index);
    }}
    title={photo.label}
    className="group relative aspect-[16/9] min-h-[58px] max-h-[120px] w-full overflow-hidden rounded-xl border border-slate-200 bg-zinc-50 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md active:scale-[0.98]"
  >
    <img src={photo.url} alt={photo.label} className="h-full w-full object-cover" />
  </button>
);

const PhotoGroup = ({
  title,
  photos,
  allPhotos,
  onPhotoClick,
  icon: Icon,
  color,
}: {
  title: string;
  photos: Photo[];
  allPhotos: Photo[];
  onPhotoClick: (i: number) => void;
  icon: ElementType;
  color: string;
}) => (
  <div className="min-w-0 space-y-2">
    <div className="mb-2.5 flex items-center gap-2 text-slate-500">
      <Icon size={15} style={{ color }} />
      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{title}</span>
    </div>

    {photos.length === 0 ? (
      <div className="flex aspect-[16/9] min-h-[58px] max-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Sin evidencia
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-2">
        {photos.map((photo) => (
          <PhotoThumbnail
            key={photo.label}
            photo={photo}
            index={allPhotos.findIndex((item) => item.url === photo.url)}
            onClick={onPhotoClick}
          />
        ))}
      </div>
    )}
  </div>
);

const PhotoGallery = ({ photos, onPhotoClick }: { photos: Photo[]; onPhotoClick: (i: number) => void }) => {
  const groupPhotos = photos.filter((photo) => photo.group === "group");
  const individualPhotos = photos.filter((photo) => photo.group === "individual");

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <Camera size={14} className="text-slate-500" />
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          Evidencia fotografica
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <PhotoGroup
          title="Foto grupal"
          photos={groupPhotos}
          allPhotos={photos}
          onPhotoClick={onPhotoClick}
          icon={Users}
          color="#6366f1"
        />
        <PhotoGroup
          title="Foto individual"
          photos={individualPhotos}
          allPhotos={photos}
          onPhotoClick={onPhotoClick}
          icon={User}
          color="#10b981"
        />
      </div>
    </section>
  );
};

const TimeBox = ({ label, time, color }: { label: string; time: string | null; color: string }) => (
  <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
    <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</span>
    <div className="flex items-end gap-2 font-mono text-2xl font-black leading-none text-zinc-900">
      {time ? time.substring(11, 16) : "--:--"}
      <Clock size={16} className="mb-1" style={{ color }} />
    </div>
  </div>
);

const TimeControl = ({ detail }: { detail: any }) => (
  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        Control de tiempos
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {detail.isLate && (
          <div className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 shadow-sm">
            <AlertCircle size={12} />
            <span>Tardanza: {formatLateMinutes(detail.lateMinutes)}</span>
          </div>
        )}
        {detail.earlyExitMinutes > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            <ArrowRight size={12} />
            <span>Salida anticipada: {detail.earlyExitMinutes}m</span>
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
      <TimeBox label="Ingreso" time={detail.checkInTime} color="#10b981" />
      <div className="hidden items-center text-zinc-300 sm:flex">
        <ArrowRight size={18} />
      </div>
      <TimeBox label="Salida" time={detail.checkOutTime} color="#0ea5e9" />
    </div>
  </section>
);

const Observation = ({ text }: { text: string }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-zinc-400">
      <FileText size={12} />
      <span className="text-[10px] font-black uppercase tracking-wider">Observacion</span>
    </div>
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs italic leading-relaxed text-zinc-600">
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
  <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 p-3 sm:p-4">
    <button
      type="button"
      disabled={current === 0}
      onClick={onPrev}
      className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-zinc-500 transition-all hover:text-indigo-600 disabled:opacity-30 sm:min-h-8"
    >
      <ChevronLeft size={16} /> Anterior
    </button>
    <span className="text-[10px] font-bold text-zinc-400">
      {current + 1} de {total}
    </span>
    <button
      type="button"
      disabled={current === total - 1}
      onClick={onNext}
      className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-zinc-500 transition-all hover:text-indigo-600 disabled:opacity-30 sm:min-h-8"
    >
      Siguiente <ChevronRight size={16} />
    </button>
  </div>
);

export const AttendanceDetailModal = ({ selectedDetail, onClose, getStatusStyle }: AttendanceDetailModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setActivePhotoIndex(null);
  }, [selectedDetail]);

  if (!selectedDetail) return null;

  const details = Array.isArray(selectedDetail) ? selectedDetail : [selectedDetail];
  const currentDetail = details[currentIndex] ?? details[0];
  const status = getStatusStyle(currentDetail.attendanceStatusId);
  const allPhotos = buildPhotos(currentDetail);
  const showPhotoEvidence = allPhotos.length > 0 && !isBiometricAttendance(currentDetail);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-in zoom-in-95 duration-300 sm:max-w-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 items-center justify-between gap-3 border-b border-zinc-100 bg-slate-50/60 px-4 py-2.5 sm:py-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-black leading-none tracking-tight text-slate-800 sm:text-base">
                {currentDetail.workerName}
              </h3>
              <span className="flex-shrink-0 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[9px] font-black tracking-tight text-sky-700">
                {format(parseISO(currentDetail.attendanceDate), "dd/MM/yyyy")}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800 sm:h-8 sm:w-8"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            <TimeControl detail={currentDetail} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <GridDetailItem label="Estado" value={status.label} icon={Hash} color={status.dot} colSpan="sm:col-span-2" />
              <GridDetailItem
                label="Cliente"
                value={currentDetail.clientsName || "Sin Cliente"}
                icon={Building2}
                colSpan="sm:col-span-2"
              />
              <GridDetailItem
                label="Proyecto"
                value={currentDetail.projectName}
                icon={Briefcase}
                colSpan="sm:col-span-2"
              />
            </div>

            {showPhotoEvidence && <PhotoGallery photos={allPhotos} onPhotoClick={setActivePhotoIndex} />}

            {currentDetail.observation && <Observation text={currentDetail.observation} />}
          </div>

          {details.length > 1 && (
            <NavigationFooter
              current={currentIndex}
              total={details.length}
              onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(details.length - 1, prev + 1))}
            />
          )}
        </div>
      </div>

      <ImageViewer
        open={activePhotoIndex !== null}
        images={allPhotos.map((p) => p.url)}
        initialIndex={activePhotoIndex ?? 0}
        onClose={() => setActivePhotoIndex(null)}
      />
    </>
  );
};
