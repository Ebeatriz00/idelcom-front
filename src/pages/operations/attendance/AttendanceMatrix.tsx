import { useState, useMemo } from "react";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileDown
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";

import { useAttendanceMatrix } from "@/sharedKernel/hooks/operations/attendance/useAttendanceMatrix";
import { useAttendanceStatusSelect } from "@/sharedKernel/hooks/operations/attendance-status/useAttendanceStatus";

import { StatCard } from "./components/StatCard";
import { AttendanceDetailModal } from "./components/modals/AttendanceDetailModal";
import { AttendanceFilters } from "./components/AttendanceFilters";
import { AttendanceTable } from "./components/AttendanceTable";
import { useAttendanceExport } from "./hooks/useAttendanceExport";

export default function AttendanceMatrix() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [opporId, setOpporId] = useState<number>();
  const [workOrderId, setWorkOrderId] = useState<number>();
  const [squadId, setSquadId] = useState<number>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | number>("all");
  const pageSize = 1000; // Carga masiva para que crezca hacia abajo
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const dateRange = useMemo(() => ({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  }), [selectedDate]);

  const { data, isLoading } = useAttendanceMatrix({
    startDate: format(dateRange.start, "yyyy-MM-dd"),
    endDate: format(dateRange.end, "yyyy-MM-dd"),
    opporId,
    workOrderId,
    squadId,
    search,
    statusId: statusFilter === "all" ? undefined : (statusFilter as number),
    page: 1,
    pageSize
  });

  const { data: attendanceStatusList } = useAttendanceStatusSelect(1, 50);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  const matrixData = useMemo(() => {
    const map: Record<number, { name: string, workerDocument: string, records: Record<string, any[]> }> = {};
    const details = data?.details;
    if (!details) return map;

    details.forEach((detail: any) => {
      const wId = detail.workerId;
      const wName = detail.workerName;
      const aDate = detail.attendanceDate;

      if (!map[wId]) {
        map[wId] = { name: wName, workerDocument: detail.workerDocument, records: {} };
      }

      const dateKey = aDate.split("T")[0];
      if (!map[wId].records[dateKey]) {
        map[wId].records[dateKey] = [];
      }
      const projectInfo = data?.projects?.find((p: any) => p.opporId === detail.opporId);
      map[wId].records[dateKey].push({ 
        ...detail, 
        projectName: projectInfo?.opporDesc || "Sin proyecto",
        clientsName: detail.clientsName || projectInfo?.clientsName || "Sin cliente"
      });
    });
    return map;
  }, [data?.details, data?.projects]);

  const stats = useMemo(() => {
    const details = data?.details ?? [];
    return {
      total: data?.totalWorkers ?? details.length,
      attendance: details.filter((d: any) => d.attendanceStatusId === 1).length,
      late: details.filter((d: any) => d.attendanceStatusId === 3).length,
      absent: details.filter((d: any) => d.attendanceStatusId === 2).length
    };
  }, [data]);

  const { onXlsx } = useAttendanceExport(matrixData, days, dateRange.start);

  const handleExport = () => {
    onXlsx();
  };

  const getStatusStyle = (id: number | string) => {
    const statusItems = (attendanceStatusList as any)?.items;
    const found = statusItems?.find((s: any) => s.value == id);

    if (found) {
      let color = found.stateColor || "#64748b";
      if (color && !color.startsWith("#") && !color.startsWith("rgb") && !color.startsWith("hsl")) {
        color = `#${color}`;
      }

      return {
        color: color,
        bg: `${color}15`,
        border: `${color}33`,
        dot: color,
        label: found.label || "-"
      };
    }
    return { color: "#94a3b8", bg: "transparent", border: "transparent", dot: "#94a3b8", label: "-" };
  };

  return (
    <div className="min-h-screen max-w-full flex flex-col relative p-6 space-y-6 bg-slate-50/30 overflow-x-hidden selection:bg-indigo-100">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "Matriz de Asistencia", current: true },
        ]}
        extraContent={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={Object.keys(matrixData).length === 0}
              className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50"
            >
              <FileDown size={14} />
              <span>Exportar</span>
            </button>

            <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setSelectedDate(prev => subMonths(prev, 1))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-zinc-500"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 text-sm font-bold text-zinc-700 min-w-[140px] text-center capitalize">
              {format(selectedDate, "MMMM yyyy", { locale: es })}
            </div>
            <button
              onClick={() => setSelectedDate(prev => addMonths(prev, 1))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-zinc-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Trabajadores" value={data?.totalWorkers ?? 0} accent="#6366f1" icon={Users} sub="Personal asignado" />
        <StatCard label="Asistencias" value={stats.attendance} accent="#10b981" icon={CheckCircle2} sub={`${stats.total ? Math.round(stats.attendance / stats.total * 100) : 0}% efectividad`} />
        <StatCard label="Inasistencias" value={stats.absent} accent="#ef4444" icon={XCircle} sub="Faltas registradas" />
        <StatCard label="Tardanzas" value={stats.late} accent="#f59e0b" icon={Clock} sub="Fuera de horario" />
      </div>

      <AttendanceFilters
        opporId={opporId}
        setOpporId={setOpporId}
        workOrderId={workOrderId}
        setWorkOrderId={setWorkOrderId}
        squadId={squadId}
        setSquadId={setSquadId}
        search={search}
        setSearch={setSearch}
        projects={data?.projects}
        workOrders={data?.workOrders}
        squads={data?.squads}
      />

      <AttendanceTable
        days={days}
        isLoading={isLoading}
        matrixData={matrixData}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalWorkers={data?.totalWorkers ?? 0}
        setSelectedDetail={setSelectedDetail}
        getStatusStyle={getStatusStyle}
      />

      <AttendanceDetailModal
        selectedDetail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        getStatusStyle={getStatusStyle}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f4f4f5; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 20px; border: 2px solid #f4f4f5; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
      `}</style>
    </div>
  );
}
