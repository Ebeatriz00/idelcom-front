import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Filter } from "lucide-react";

interface AttendanceTableProps {
  days: Date[];
  isLoading: boolean;
  matrixData: Record<number, { name: string; workerDocument: string; records: Record<string, any[]> }>;
  statusFilter: string | number;
  setStatusFilter: (f: string | number) => void;
  totalWorkers: number;
  setSelectedDetail: (detail: any) => void;
  getStatusStyle: (id: number | string) => any;
}

const getAvatarStyle = (name: string) => {
  const colors = [
    { gradient: "from-indigo-500 to-purple-500 text-white" },
    { gradient: "from-emerald-500 to-teal-500 text-white" },
    { gradient: "from-sky-500 to-blue-600 text-white" },
    { gradient: "from-rose-500 to-pink-500 text-white" },
    { gradient: "from-amber-500 to-orange-500 text-white" },
    { gradient: "from-violet-500 to-fuchsia-500 text-white" },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getDayInfo = (day: Date) => {
  const dayOfWeek = day.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  return { isWeekend, isToday };
};

const getWorkerStats = (records: Record<string, any[]>) => {
  let countAsist = 0;
  let countFaltas = 0;
  let countTard = 0;

  Object.values(records).forEach((dayRecords) => {
    if (dayRecords && dayRecords.length > 0) {
      const r = dayRecords[0];
      if (r.attendanceStatusId === 1) {
        countAsist++;
      } else if (r.attendanceStatusId === 2) {
        countFaltas++;
      }
      if (r.isLate || r.attendanceStatusId === 3) {
        countTard++;
      }
    }
  });

  return { countAsist, countFaltas, countTard };
};

const formatTime = (value?: string | null) => {
  if (!value) return "--:--";
  const isoTime = value.includes("T") ? value.substring(11, 16) : value.substring(0, 5);
  if (!isoTime) return "--:--";

  const [hourText, minuteText] = isoTime.split(":");
  const hour = Number(hourText);
  if (Number.isNaN(hour)) return isoTime;

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText} ${period}`;
};

const getRecordTime = (record: any) => ({
  inTime: formatTime(record.checkInTime),
  outTime: formatTime(record.checkOutTime),
});

const getWorkerProjectSummary = (records: Record<string, any[]>) => {
  const projects = Array.from(
    new Set(
      Object.values(records)
        .flat()
        .map((record) => record.projectName)
        .filter(Boolean)
    )
  );

  return {
    label: projects[0] ?? "Sin proyecto",
    extraCount: Math.max(0, projects.length - 1),
  };
};

export const AttendanceTable = ({
  days,
  isLoading,
  matrixData,
  statusFilter,
  setStatusFilter,
  setSelectedDetail,
  getStatusStyle,
}: AttendanceTableProps) => {
  const mobileLeadingDays = days[0] ? (days[0].getDay() + 6) % 7 : 0;
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Matriz de Registro
        </div>

        <div className="flex w-full gap-2 overflow-x-auto pb-1 text-[10px] font-bold text-zinc-600 sm:w-auto sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all sm:min-h-8 sm:py-1.5 ${
              statusFilter === "all"
                ? "scale-[1.02] border-zinc-900 bg-zinc-900 text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
          >
            TODOS
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 1 ? "all" : 1)}
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 transition-all sm:min-h-8 sm:py-1.5 ${
              statusFilter === 1
                ? "scale-[1.02] border-emerald-500/30 bg-emerald-50 text-emerald-800 shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-emerald-50/20 hover:text-emerald-600"
            }`}
          >
            <div className="h-5 w-5 flex-shrink-0 rounded-lg border border-emerald-600/30 bg-emerald-500 shadow-sm" />
            <span>ASISTIO</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 2 ? "all" : 2)}
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 transition-all sm:min-h-8 sm:py-1.5 ${
              statusFilter === 2
                ? "scale-[1.02] border-rose-500/30 bg-rose-50 text-rose-800 shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-rose-50/20 hover:text-rose-600"
            }`}
          >
            <div className="h-5 w-5 flex-shrink-0 rounded-lg border border-rose-600/30 bg-rose-500 shadow-sm" />
            <span>NO ASISTIO</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 3 ? "all" : 3)}
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 transition-all sm:min-h-8 sm:py-1.5 ${
              statusFilter === 3
                ? "scale-[1.02] border-amber-500/30 bg-amber-50 text-amber-800 shadow-sm"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-amber-50/20 hover:text-amber-600"
            }`}
          >
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border border-amber-200/40 bg-amber-100 text-amber-600 shadow-sm">
              <Clock size={11} className="stroke-[3]" />
            </div>
            <span>TARDE</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 bg-zinc-50/40 p-3 md:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm font-medium text-zinc-400 animate-pulse">
            Cargando matriz de asistencia...
          </div>
        ) : Object.keys(matrixData).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm italic text-zinc-400">
            No se encontraron registros para estos filtros.
          </div>
        ) : (
          Object.entries(matrixData).map(([workerId, { name, workerDocument, records }]) => {
            const avatar = getAvatarStyle(name);
            const stats = getWorkerStats(records);
            const project = getWorkerProjectSummary(records);

            return (
              <article key={workerId} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-start gap-3 border-b border-zinc-100 p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br ${avatar.gradient} text-sm font-black shadow-sm`}
                  >
                    {name.substring(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black leading-5 text-zinc-900">{name}</h3>
                    <p className="font-mono text-[11px] font-semibold tracking-tight text-zinc-400">{workerDocument}</p>
                    <p className="mt-1 truncate text-[10px] font-black uppercase tracking-wide text-indigo-600">
                      {project.label}
                      {project.extraCount > 0 && <span className="text-zinc-400"> +{project.extraCount}</span>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-b border-zinc-100 text-center">
                  <div className="bg-emerald-50/50 px-2 py-2.5">
                    <div className="text-base font-black text-emerald-700">{stats.countAsist}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600/70">Asist.</div>
                  </div>
                  <div className="bg-rose-50/50 px-2 py-2.5">
                    <div className="text-base font-black text-rose-700">{stats.countFaltas}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-rose-600/70">Faltas</div>
                  </div>
                  <div className="bg-amber-50/60 px-2 py-2.5">
                    <div className="text-base font-black text-amber-700">{stats.countTard}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-amber-600/70">Tard.</div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                      <span key={`${label}-${index}`}>{label}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: mobileLeadingDays }).map((_, index) => (
                      <div key={`empty-${index}`} className="h-[66px] min-w-0" />
                    ))}

                    {days.map((day) => {
                      const dayKey = format(day, "yyyy-MM-dd");
                      const dayRecords = records[dayKey] || [];
                      const { isWeekend, isToday } = getDayInfo(day);

                      if (dayRecords.length === 0 || ![1, 2, 3].includes(dayRecords[0].attendanceStatusId)) {
                        return (
                          <div
                            key={dayKey}
                            className={`flex h-[66px] min-w-0 items-center justify-center rounded-xl border text-sm font-black ${
                              isToday
                                ? "border-indigo-200 bg-indigo-50 text-indigo-500"
                                : isWeekend
                                  ? "border-zinc-100 bg-zinc-50 text-zinc-300"
                                  : "border-zinc-100 bg-white text-zinc-300"
                            }`}
                          >
                            {format(day, "dd")}
                          </div>
                        );
                      }

                      const r = dayRecords[0];
                      const st = getStatusStyle(r.attendanceStatusId);
                      const isFaded = statusFilter !== "all" && r.attendanceStatusId != statusFilter;
                      const hasMultiple = dayRecords.length > 1;
                      const { inTime, outTime } = getRecordTime(r);

                      return (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => setSelectedDetail(dayRecords)}
                          className={`relative flex h-[66px] min-w-0 flex-col items-center justify-center rounded-xl border px-0.5 text-[10px] font-black transition-all active:scale-95 ${
                            r.attendanceStatusId === 1
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : r.attendanceStatusId === 2
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          } ${isToday ? "ring-2 ring-indigo-100" : ""}`}
                          style={{ opacity: isFaded ? 0.4 : 1 }}
                          title={`${format(day, "dd/MM")} - ${st.label} | Entrada: ${inTime} | Salida: ${outTime}`}
                        >
                          <span className="text-sm leading-none">{format(day, "dd")}</span>
                          <span className="mt-0.5 flex h-3 items-center justify-center">
                            {r.attendanceStatusId === 1 ? (
                              <span className="h-2 w-2 rounded bg-emerald-500" />
                            ) : r.attendanceStatusId === 2 ? (
                              <span className="h-2 w-2 rounded bg-rose-500" />
                            ) : (
                              <Clock size={10} className="stroke-[3]" />
                            )}
                          </span>
                          <span className="mt-1 w-full truncate font-mono text-[10.5px] font-black leading-none text-current">
                            {inTime}
                          </span>
                          <span className="mt-0.5 w-full truncate font-mono text-[10.5px] font-black leading-none text-current/85">
                            {outTime}
                          </span>
                          {r.isLate && r.attendanceStatusId !== 3 && (
                            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
                          )}
                          {hasMultiple && (
                            <span className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-zinc-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="custom-scrollbar hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1680px] border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="sticky left-0 z-30 min-w-[300px] border-b border-r border-zinc-200 bg-zinc-50 p-4 text-left shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] xl:min-w-[360px]">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                    Trabajador
                  </span>
                </div>
              </th>

              <th className="sticky left-[300px] z-30 min-w-[64px] border-b border-r border-zinc-200 bg-emerald-50 p-3 text-center text-[9px] font-bold uppercase tracking-wider text-emerald-700 xl:left-[360px]">
                Asist.
              </th>
              <th className="sticky left-[364px] z-30 min-w-[64px] border-b border-r border-zinc-200 bg-rose-50 p-3 text-center text-[9px] font-bold uppercase tracking-wider text-rose-700 xl:left-[424px]">
                Faltas
              </th>
              <th className="sticky left-[428px] z-30 min-w-[64px] border-b border-r border-zinc-200 bg-amber-50 p-3 text-center text-[9px] font-bold uppercase tracking-wider text-amber-700 xl:left-[488px]">
                Tard.
              </th>

              {days.map((day) => {
                const { isWeekend, isToday } = getDayInfo(day);
                return (
                  <th
                    key={day.toISOString()}
                    className={`min-w-[84px] border-b border-zinc-200 p-2 text-center transition-colors last:border-r-0 sm:p-3 ${
                      isToday
                        ? "border-x border-x-indigo-100 bg-indigo-50/30"
                        : isWeekend
                          ? "bg-zinc-50/50"
                          : ""
                    }`}
                  >
                    <div className={`mb-0.5 text-[9px] font-bold uppercase ${isToday ? "text-indigo-600" : "text-zinc-400"}`}>
                      {format(day, "EEE", { locale: es })}
                    </div>
                    <div
                      className={`font-mono text-xs font-black ${
                        isToday
                          ? "inline-block scale-105 text-indigo-600"
                          : isWeekend
                            ? "text-zinc-400"
                            : "text-zinc-600"
                      }`}
                    >
                      {format(day, "dd")}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={days.length + 4} className="p-8 text-center font-medium text-zinc-400 animate-pulse sm:p-12">
                  Cargando matriz de asistencia...
                </td>
              </tr>
            ) : Object.keys(matrixData).length === 0 ? (
              <tr>
                <td colSpan={days.length + 4} className="p-8 text-center italic text-zinc-400 sm:p-12">
                  No se encontraron registros para estos filtros.
                </td>
              </tr>
            ) : (
              Object.entries(matrixData).map(([workerId, { name, workerDocument, records }]) => {
                const stats = getWorkerStats(records);
                const project = getWorkerProjectSummary(records);

                return (
                  <tr key={workerId} className="group transition-colors hover:bg-zinc-50/80">
                    <td className="sticky left-0 z-20 border-r border-zinc-200 bg-white p-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] transition-colors group-hover:bg-zinc-50 sm:p-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatar = getAvatarStyle(name);
                          return (
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br ${avatar.gradient} text-xs font-bold shadow-sm transition-all group-hover:scale-105`}
                            >
                              {name.substring(0, 1)}
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <div className="max-w-[230px] truncate text-xs font-bold text-zinc-800 xl:max-w-[290px]">
                            {name}
                          </div>
                          <div className="truncate font-mono text-[10px] tracking-tight text-zinc-400">
                            {workerDocument}
                          </div>
                          <div className="mt-1 max-w-[230px] whitespace-normal break-words text-[9px] font-black uppercase leading-snug tracking-wide text-indigo-600 xl:max-w-[290px]">
                            {project.label}
                            {project.extraCount > 0 && <span className="text-zinc-400"> +{project.extraCount}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="sticky left-[300px] z-20 border-r border-zinc-200/50 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-800 group-hover:bg-emerald-50 xl:left-[360px]">
                      {stats.countAsist}
                    </td>
                    <td className="sticky left-[364px] z-20 border-r border-zinc-200/50 bg-rose-50 p-3 text-center text-xs font-bold text-rose-800 group-hover:bg-rose-50 xl:left-[424px]">
                      {stats.countFaltas}
                    </td>
                    <td className="sticky left-[428px] z-20 border-r border-zinc-200/50 bg-amber-50 p-3 text-center text-xs font-bold text-amber-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] group-hover:bg-amber-50 xl:left-[488px]">
                      {stats.countTard}
                    </td>

                    {days.map((day) => {
                      const dayKey = format(day, "yyyy-MM-dd");
                      const dayRecords = records[dayKey] || [];
                      const { isWeekend, isToday } = getDayInfo(day);

                      return (
                        <td
                          key={dayKey}
                          className={`border-l border-zinc-50 p-0 text-center align-middle transition-colors last:border-r-0 ${
                            isToday
                              ? "border-x border-x-indigo-100/30 bg-indigo-50/15"
                              : isWeekend
                                ? "bg-zinc-50/10"
                                : ""
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            {dayRecords.length > 0 && [1, 2, 3].includes(dayRecords[0].attendanceStatusId) ? (
                              (() => {
                                const r = dayRecords[0];
                                const st = getStatusStyle(r.attendanceStatusId);
                                const isFaded = statusFilter !== "all" && r.attendanceStatusId != statusFilter;
                                const hasMultiple = dayRecords.length > 1;
                                const { inTime, outTime } = getRecordTime(r);

                                return (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDetail(dayRecords)}
                                    className="group relative mx-auto flex min-h-[58px] w-full cursor-pointer flex-col items-center justify-center rounded-md p-0 transition-all hover:bg-zinc-100/80 active:bg-zinc-200/50"
                                    style={{
                                      opacity: isFaded ? 0.4 : 1,
                                      transform: isFaded ? "scale(0.9)" : "scale(1)",
                                    }}
                                    title={`${st.label} | Entrada: ${inTime} | Salida: ${outTime} ${hasMultiple ? `(+${dayRecords.length - 1})` : ""}`}
                                  >
                                    <div className="w-full text-center font-mono text-[11px] font-black leading-none text-zinc-700">
                                      <div className="truncate font-sans text-[11px] uppercase tracking-tight" style={{ color: st.dot }}>
                                        {st.label}
                                      </div>
                                      <div className="truncate">E {inTime}</div>
                                      <div className="truncate">S {outTime}</div>
                                    </div>

                                    {r.isLate && r.attendanceStatusId !== 3 && (
                                      <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white animate-pulse" />
                                    )}
                                    {hasMultiple && (
                                      <div className="absolute -bottom-0.5 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-full bg-zinc-400" />
                                    )}
                                  </button>
                                );
                              })()
                            ) : (
                              <div className="select-none text-xs font-bold text-zinc-300">-</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 p-4">
        <div className="text-xs font-medium text-zinc-500">
          Total: <span className="font-bold text-zinc-900">{Object.keys(matrixData).length}</span> trabajadores registrados
        </div>
      </div>
    </div>
  );
};
