import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Filter, Clock } from "lucide-react";

interface AttendanceTableProps {
  days: Date[];
  isLoading: boolean;
  matrixData: Record<number, { name: string, workerDocument: string, records: Record<string, any[]> }>;
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
    { gradient: "from-violet-500 to-fuchsia-500 text-white" }
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getDayInfo = (day: Date) => {
  const dayOfWeek = day.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  return { isWeekend, isToday };
};

export const AttendanceTable = ({
  days,
  isLoading,
  matrixData,
  statusFilter,
  setStatusFilter,
  setSelectedDetail,
  getStatusStyle
}: AttendanceTableProps) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-zinc-200 bg-zinc-50/50">
        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Matriz de Registro
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-bold text-zinc-600">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold tracking-wider transition-all uppercase ${
              statusFilter === "all"
                ? "bg-zinc-900 border-zinc-900 text-white shadow-sm scale-[1.02]"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            TODOS
          </button>
          
          <button
            onClick={() => setStatusFilter(statusFilter === 1 ? "all" : 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              statusFilter === 1
                ? "bg-emerald-50 border-emerald-500/30 text-emerald-800 shadow-sm scale-[1.02]"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50/20"
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500 border border-emerald-600/30 shadow-sm flex-shrink-0" />
            <span>ASISTIÓ</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 2 ? "all" : 2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              statusFilter === 2
                ? "bg-rose-50 border-rose-500/30 text-rose-800 shadow-sm scale-[1.02]"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-rose-600 hover:bg-rose-50/20"
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-rose-500 border border-rose-600/30 shadow-sm flex-shrink-0" />
            <span>NO ASISTIÓ</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 3 ? "all" : 3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              statusFilter === 3
                ? "bg-amber-50 border-amber-500/30 text-amber-800 shadow-sm scale-[1.02]"
                : "bg-white border-zinc-200 text-zinc-500 hover:text-amber-600 hover:bg-amber-50/20"
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200/40 shadow-sm flex-shrink-0">
              <Clock size={11} className="stroke-[3]" />
            </div>
            <span>TARDE</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-50/50">
              <th className="sticky left-0 z-20 bg-zinc-50 p-4 text-left border-b border-r border-zinc-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-w-[240px]">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Trabajador</span>
                </div>
              </th>

              {/* Summary Columns Headers */}
              <th className="p-3 text-center border-b border-r border-zinc-200 bg-emerald-50/30 text-emerald-700 font-bold text-[9px] uppercase tracking-wider min-w-[70px]">
                Σ Asist
              </th>
              <th className="p-3 text-center border-b border-r border-zinc-200 bg-rose-50/30 text-rose-700 font-bold text-[9px] uppercase tracking-wider min-w-[70px]">
                Σ Faltas
              </th>
              <th className="p-3 text-center border-b border-r border-zinc-200 bg-amber-50/30 text-amber-700 font-bold text-[9px] uppercase tracking-wider min-w-[70px]">
                Σ Tard
              </th>

              {days.map(day => {
                const { isWeekend, isToday } = getDayInfo(day);
                return (
                  <th 
                    key={day.toISOString()} 
                    className={`p-3 text-center border-b border-zinc-200 min-w-[50px] last:border-r-0 transition-colors ${
                      isToday 
                        ? "bg-indigo-50/30 border-x border-x-indigo-100" 
                        : isWeekend 
                          ? "bg-zinc-50/50" 
                          : ""
                    }`}
                  >
                    <div className={`text-[9px] font-bold uppercase mb-0.5 ${isToday ? "text-indigo-600" : "text-zinc-400"}`}>
                      {format(day, "EEE", { locale: es })}
                    </div>
                    <div className={`text-xs font-mono font-black ${
                      isToday 
                        ? "text-indigo-600 scale-105 inline-block" 
                        : isWeekend 
                          ? "text-zinc-400" 
                          : "text-zinc-600"
                    }`}>
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
                <td colSpan={days.length + 4} className="p-12 text-center text-zinc-400 animate-pulse font-medium">Cargando matriz de asistencia...</td>
              </tr>
            ) : Object.keys(matrixData).length === 0 ? (
              <tr>
                <td colSpan={days.length + 4} className="p-12 text-center text-zinc-400 italic">No se encontraron registros para estos filtros.</td>
              </tr>
            ) : (
              Object.entries(matrixData).map(([workerId, { name, workerDocument, records }]) => {
                // Calculate Stats for each worker
                const stats = (() => {
                  let countAsist = 0;
                  let countFaltas = 0;
                  let countTard = 0;
                  Object.values(records).forEach(dayRecords => {
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
                })();

                return (
                  <tr key={workerId} className="group hover:bg-zinc-50/80 transition-colors">
                    <td className="sticky left-0 z-10 p-4 border-r border-zinc-200 bg-white transition-colors group-hover:bg-zinc-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatar = getAvatarStyle(name);
                          return (
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center font-bold text-xs border border-white/20 shadow-sm transition-all group-hover:scale-105`}>
                              {name.substring(0, 1)}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="text-xs font-bold text-zinc-800 line-clamp-1">{name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono tracking-tight">{workerDocument}</div>
                        </div>
                      </div>
                    </td>

                    {/* Summary Columns Cells */}
                    <td className="p-3 text-center font-bold text-xs bg-emerald-50/15 text-emerald-800 border-r border-zinc-200/50">
                      {stats.countAsist}
                    </td>
                    <td className="p-3 text-center font-bold text-xs bg-rose-50/15 text-rose-800 border-r border-zinc-200/50">
                      {stats.countFaltas}
                    </td>
                    <td className="p-3 text-center font-bold text-xs bg-amber-50/15 text-amber-800 border-r border-zinc-200/50">
                      {stats.countTard}
                    </td>

                    {days.map(day => {
                      const dayKey = format(day, "yyyy-MM-dd");
                      const dayRecords = records[dayKey] || [];
                      const { isWeekend, isToday } = getDayInfo(day);

                      return (
                        <td 
                          key={dayKey} 
                          className={`p-1.5 align-middle text-center border-l border-zinc-50 last:border-r-0 transition-colors ${
                            isToday 
                              ? "bg-indigo-50/15 border-x border-x-indigo-100/30" 
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

                                return (
                                  <div
                                    onClick={() => setSelectedDetail(dayRecords)}
                                    className="group relative flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-zinc-100/80 active:bg-zinc-200/50 transition-all mx-auto"
                                    style={{
                                      opacity: isFaded ? 0.4 : 1,
                                      transform: isFaded ? "scale(0.9)" : "scale(1)"
                                    }}
                                    title={`${st.label} ${hasMultiple ? `(+${dayRecords.length - 1})` : ""}`}
                                  >
                                    {r.attendanceStatusId === 1 ? (
                                      <div className="w-5 h-5 rounded-lg bg-emerald-500 border border-emerald-600/30 shadow-sm flex-shrink-0" />
                                    ) : r.attendanceStatusId === 2 ? (
                                      <div className="w-5 h-5 rounded-lg bg-rose-500 border border-rose-600/30 shadow-sm flex-shrink-0" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200/40">
                                        <Clock size={11} className="stroke-[3]" />
                                      </div>
                                    )}

                                    {/* Small late overlay indicator if they checked in but are late */}
                                    {r.isLate && r.attendanceStatusId !== 3 && (
                                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white animate-pulse" />
                                    )}
                                    {hasMultiple && (
                                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-0.5 bg-zinc-400 rounded-full" />
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="text-zinc-300 font-bold text-xs select-none">•</div>
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

      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="text-xs text-zinc-500 font-medium">
          Total: <span className="text-zinc-900 font-bold">{Object.keys(matrixData).length}</span> trabajadores registrados
        </div>
      </div>
    </div>
  );
};
