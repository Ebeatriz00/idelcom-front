import type { OperationsWorkOrderProgressResponseDto } from "@/application";
import { fetchOperationsWorkOrderProgressReport } from "@/infrastructure";
import { Modal } from "@/layouts";
import type { ColumnSpec } from "@/sharedKernel";
import {
  showApiError,
  useOperationsWorkOrderProgressList,
  useWorkOrderActivitySelect,
} from "@/sharedKernel";
import { exportExcel } from "@/sharedKernel/utils/export/exportsGeneric";
import { clsx, type ClassValue } from "clsx";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Filter,
  Image as ImageIcon,
  Loader2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { WorkOrderProgressPhotos } from "./WorkOrderProgressPhotos";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  open: boolean;
  onClose: () => void;
  operationsId: number | null;
  activityId?: number | null;
  targetQuantity?: number | null;
  selectedOrder?: any;
}

type ViewType = "dia" | "semana";

function formatDateLabel(dateStr: string) {
  if (!dateStr) return { day: 0, month: "", full: "" };
  const [y, m, d] = dateStr.split("-");
  const months = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];
  return {
    day: parseInt(d),
    month: months[parseInt(m) - 1],
    full: `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`,
  };
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <p className="text-xl font-black leading-none tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WorkOrderProgressModal({
  open,
  onClose,
  operationsId,
  activityId,
  selectedOrder,
}: Props) {
  const [view, setView] = useState<ViewType>("dia");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<
    number | null
  >(activityId || null);
  const [selectedProgressItem, setSelectedProgressItem] =
    useState<OperationsWorkOrderProgressResponseDto | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftPos.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const { data: activitiesData } = useWorkOrderActivitySelect(
    operationsId ?? 0,
    1,
    500,
    "",
  );
  const activitiesList = activitiesData?.items || [];

  const { data, isLoading } = useOperationsWorkOrderProgressList(
    1,
    500,
    undefined,
    "",
    undefined,
    operationsId ?? 0,
  );

  const allItems = data?.items || [];

  const activityItems = useMemo(() => {
    let filtered = allItems;
    if (selectedActivityFilter) {
      filtered = allItems.filter(
        (item) => item.activityId === selectedActivityFilter,
      );
    }

    const byActivity: Record<number, typeof filtered> = {};
    filtered.forEach((item) => {
      if (!byActivity[item.activityId]) byActivity[item.activityId] = [];
      byActivity[item.activityId].push(item);
    });

    let calculated: typeof filtered = [];

    Object.values(byActivity).forEach((items) => {
      let accumulated = 0;
      const reversed = [...items].reverse();
      const withRunningTotal = reversed.map((item) => {
        accumulated += item.reportedQuantity || 0;
        return { ...item, runningTotal: accumulated };
      });
      calculated = [...calculated, ...withRunningTotal];
    });

    return calculated.sort((a, b) => b.progressId - a.progressId);
  }, [allItems, selectedActivityFilter]);

  const availableDates = useMemo(() => {
    const dates = activityItems.map((item) => item.reportedDate.split("T")[0]);
    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  }, [activityItems]);

  useEffect(() => {
    if (open && availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [open, availableDates, selectedDate]);

  const displayedItems = useMemo(() => {
    if (view === "dia") {
      return activityItems.filter(
        (item) => item.reportedDate.split("T")[0] === selectedDate,
      );
    }
    return activityItems;
  }, [activityItems, view, selectedDate]);

  const stats = useMemo(() => {
    const firstItem = activityItems[0];
    const currentQty = firstItem?.currentQuantity || 0;
    const targetQty = firstItem?.targetQuantity || 0;

    let percentage = 0;
    if (targetQty > 0) {
      percentage = Math.round((Number(currentQty) / targetQty) * 100);
    }

    const uniquePersons = new Set(
      activityItems.map((i) => i.workerName).filter(Boolean),
    ).size;

    return {
      count: activityItems.length,
      persons: uniquePersons,
      current:
        currentQty % 1 === 0 ? currentQty : Number(currentQty).toFixed(1),
      target: targetQty % 1 === 0 ? targetQty : Number(targetQty).toFixed(1),
      percentage,
      hasTarget: targetQty > 0,
    };
  }, [activityItems]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof allItems> = {};
    displayedItems.forEach((item) => {
      const date = item.reportedDate.split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [displayedItems]);

  const handleExportExcel = async () => {
    try {
      const headerInfo = selectedOrder
        ? [
            {
              label: "Cliente:",
              value: selectedOrder.clientsName || "No registrado",
            },
            {
              label: "Proyecto:",
              value: selectedOrder.opporDesc || "No registrado",
            },
            {
              label: "N° de Oportunidad:",
              value: selectedOrder.opporNum || "No registrado",
            },
            {
              label: "Jefe de Proyecto:",
              value: selectedOrder.projectManager || "No registrado",
            },
          ]
        : [];

      const reportData = await fetchOperationsWorkOrderProgressReport(
        operationsId || 0,
      );

      const summaryData = reportData.summaries || [];
      const detailsData = reportData.details || [];

      const summaryTableColumns: ColumnSpec<any>[] = [
        {
          label: "Responsable",
          value: (r) => r.responsibleName || "Sin asignar",
          width: 30,
        },
        {
          label: "Orden de Trabajo (OT)",
          value: (r) => r.workOrderCode,
          width: 30,
        },
        {
          label: "Porcentaje",
          value: (r) => `${r.progressPercentage}%`,
          width: 15,
        },
      ];

      const activitySummaryMap = new Map<number, any>();
      detailsData.forEach((item) => {
        if (!activitySummaryMap.has(item.activityId)) {
          activitySummaryMap.set(item.activityId, {
            activityName: item.activityName,
            progressPercentage: item.activityProgressPercentage || 0,
            targetQuantity: item.targetQuantity || 0,
            currentQuantity: item.currentQuantity || 0,
            measurementUnitSymbol: item.measurementUnitSymbol || "",
          });
        }
      });

      const activitySummaryData = Array.from(activitySummaryMap.values());

      const activitySummaryTableColumns: ColumnSpec<any>[] = [
        {
          label: "Actividad",
          value: (r) => r.activityName || "Desconocida",
          width: 40,
        },
        { label: "Unidad", value: (r) => r.measurementUnitSymbol, width: 15 },
        { label: "Avance Total", value: (r) => r.currentQuantity, width: 15 },
        { label: "Meta", value: (r) => r.targetQuantity, width: 15 },
        {
          label: "Porcentaje Global",
          value: (r) => `${r.progressPercentage}%`,
          width: 20,
        },
      ];

      const rawColumns: ColumnSpec<any>[] = [
        {
          label: "Fecha",
          value: (r) => (r.reportedDate ? r.reportedDate.split("T")[0] : ""),
          width: 15,
        },
        {
          label: "Actividad",
          value: (r) => r.activityName || "Desconocida",
          width: 35,
        },
        {
          label: "Unidad",
          value: (r) => r.measurementUnitSymbol || "",
          width: 10,
        },
        {
          label: "Responsable",
          value: (r) => r.workerName || "Sin asignar",
          width: 30,
        },
        {
          label: "Avance Reportado",
          value: (r) => r.reportedQuantity,
          width: 15,
        },
        {
          label: "Observaciones",
          value: (r) => r.observations || "Sin observaciones",
          width: 40,
        },
      ];

      const rawData = [...detailsData].sort((a, b) => {
        const dateA = a.reportedDate || "";
        const dateB = b.reportedDate || "";
        return dateB.localeCompare(dateA);
      });

      await exportExcel(rawData, rawColumns, {
        filePrefix: "Historial_Reportes",
        title: "Historial de Reportes de Avance",
        sheetName: "Historial",
        headerInfo,
        summaryTables: [
          {
            title: "Resumen de Órdenes de Trabajo",
            columns: summaryTableColumns,
            data: summaryData,
          },
          {
            title: "Resumen de Progreso de Actividades",
            columns: activitySummaryTableColumns,
            data: activitySummaryData,
          },
        ],
      });
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      showApiError(error);
      alert(
        "Hubo un error al intentar exportar el Excel. Revisa la consola o asegúrate de que el Backend está corriendo con los últimos cambios.",
      );
    }
  };

  const handleExportExcel = async () => {
    try {
      const headerInfo = selectedOrder ? [
        { label: "Cliente:", value: selectedOrder.clientsName || "No registrado" },
        { label: "Proyecto:", value: selectedOrder.opporDesc || "No registrado" },
        { label: "N° de Oportunidad:", value: selectedOrder.opporNum || "No registrado" },
        { label: "Jefe de Proyecto:", value: selectedOrder.projectManager || "No registrado" }
      ] : [];

      // 1. OBTENER LA DATA CONSOLIDADA DEL NUEVO ENDPOINT
      const reportData = await fetchOperationsWorkOrderProgressReport(operationsId || 0);
      
      const summaryData = reportData.summaries || [];
      const detailsData = reportData.details || [];

      // 2. CONFIGURAR LA TABLA DE RESUMEN DE OTs
      const summaryTableColumns: ColumnSpec<any>[] = [
        { label: "Responsable", value: r => r.responsibleName || "Sin asignar", width: 30 },
        { label: "Orden de Trabajo (OT)", value: r => r.workOrderCode, width: 30 },
        { label: "Porcentaje", value: r => `${r.progressPercentage}%`, width: 15 },
      ];

      // NUEVO: RESUMEN DE ACTIVIDADES
      const activitySummaryMap = new Map<number, any>();
      detailsData.forEach(item => {
        if (!activitySummaryMap.has(item.activityId)) {
          activitySummaryMap.set(item.activityId, {
            activityName: item.activityName,
            progressPercentage: item.activityProgressPercentage || 0,
            targetQuantity: item.targetQuantity || 0,
            currentQuantity: item.currentQuantity || 0,
            measurementUnitSymbol: item.measurementUnitSymbol || ""
          });
        }
      });
      
      const activitySummaryData = Array.from(activitySummaryMap.values());

      const activitySummaryTableColumns: ColumnSpec<any>[] = [
        { label: "Actividad", value: r => r.activityName || "Desconocida", width: 40 },
        { label: "Unidad", value: r => r.measurementUnitSymbol, width: 15 },
        { label: "Avance Total", value: r => r.currentQuantity, width: 15 },
        { label: "Meta", value: r => r.targetQuantity, width: 15 },
        { label: "Porcentaje Global", value: r => `${r.progressPercentage}%`, width: 20 },
      ];

      // 3. CONSTRUIR LA TABLA PRINCIPAL (Historial en crudo)
      const rawColumns: ColumnSpec<any>[] = [
        { label: "Fecha", value: r => r.reportedDate ? r.reportedDate.split("T")[0] : "", width: 15 },
        { label: "Actividad", value: r => r.activityName || "Desconocida", width: 35 },
        { label: "Unidad", value: r => r.measurementUnitSymbol || "", width: 10 },
        { label: "Responsable", value: r => r.workerName || "Sin asignar", width: 30 },
        { label: "Avance Reportado", value: r => r.reportedQuantity, width: 15 },
        { label: "Observaciones", value: r => r.observations || "Sin observaciones", width: 40 },
      ];

      // Ordenar los detalles por fecha más reciente
      const rawData = [...detailsData].sort((a, b) => {
        const dateA = a.reportedDate || "";
        const dateB = b.reportedDate || "";
        return dateB.localeCompare(dateA);
      });

      await exportExcel(rawData, rawColumns, {
        filePrefix: "Historial_Reportes",
        title: "Historial de Reportes de Avance",
        sheetName: "Historial",
        headerInfo: headerInfo,
        summaryTables: [
          {
            title: "Resumen de Órdenes de Trabajo",
            columns: summaryTableColumns,
            data: summaryData
          },
          {
            title: "Resumen de Progreso de Actividades",
            columns: activitySummaryTableColumns,
            data: activitySummaryData
          }
        ]
      });

    } catch (error) {
      console.error("Error al exportar Excel:", error);
      showApiError(error);
      alert("Hubo un error al intentar exportar el Excel. Revisa la consola o asegúrate de que el Backend está corriendo con los últimos cambios.");
    }
  };

  if (!open) return null;

  return (
    <>
      <Modal
        onClose={onClose}
        title="Historial de Reportes"
        size="5xl"
        contentClassName="max-w-[min(96vw,78rem)]"
        bodyClassName="overflow-y-auto flex-1 min-h-0 bg-[#f6f8fb] px-3 py-3 sm:px-5 sm:py-4"
        footerClassName="flex shrink-0 items-center justify-end bg-white px-4 py-3 sm:px-5"
        footer={
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95 sm:w-auto"
          >
            Cerrar Historial
          </button>
        }
      >
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Operaciones / Avances
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Historial de Reportes
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                  Consulta los avances por actividad, revisa observaciones y
                  abre la evidencia fotográfica cuando lo necesites.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:w-[420px] lg:justify-self-end">
                <StatCard
                  label="Reportes"
                  value={stats.count}
                  icon={<ClipboardCheck className="size-4" />}
                />
                <StatCard
                  label="Personal"
                  value={stats.persons}
                  icon={<Users className="size-4" />}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full min-w-0 lg:max-w-md">
                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Filter className="size-3.5" />
                  Filtrar actividad
                </label>
                <select
                  value={selectedActivityFilter || ""}
                  onChange={(e) =>
                    setSelectedActivityFilter(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-700 outline-none transition-all focus:border-slate-400 focus:bg-white"
                >
                  <option value="">Todas las actividades</option>
                  {activitiesList.map((act: any) => (
                    <option key={act.activityId} value={act.activityId}>
                      {act.activityName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setView("dia")}
                    className={cn(
                      "min-h-10 rounded-md px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      view === "dia"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-700",
                    )}
                  >
                    Día
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("semana")}
                    className={cn(
                      "min-h-10 rounded-md px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      view === "semana"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-700",
                    )}
                  >
                    Todo
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                >
                  <Download className="size-3.5" />
                  Excel
                </button>
              </div>
            </div>

            {view === "dia" && availableDates.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByAmount(-150)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="flex min-w-0 gap-2 overflow-x-auto py-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style>{`.workorder-dates::-webkit-scrollbar { display: none; }`}</style>
                  {availableDates.map((date) => {
                    const { day, month } = formatDateLabel(date);
                    const isActive = date === selectedDate;
                    return (
                      <button
                        key={date}
                        onClick={(e) => {
                          if (
                            isDragging.current &&
                            startX.current !==
                              e.pageX -
                                (scrollContainerRef.current?.offsetLeft || 0)
                          ) {
                            e.preventDefault();
                            e.stopPropagation();
                          } else {
                            setSelectedDate(date);
                          }
                        }}
                        className={cn(
                          "flex h-9 flex-shrink-0 select-none items-center justify-center rounded-lg border px-4 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95",
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        {day} {month}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => scrollByAmount(150)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {isLoading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="size-6 animate-spin text-slate-300" />
                <p className="text-[9px] font-bold uppercase tracking-widest">
                  Sincronizando...
                </p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                <ClipboardCheck className="size-10 text-slate-200" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No se encontraron registros
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedItems.map(([date, group]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-900">
                        {formatDateLabel(date).full}
                      </span>
                      <span className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {group.length} reporte{group.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {group.map((item) => {
                        const hasObs =
                          item.observations &&
                          item.observations !== "Sin observaciones";
                        const photosCount = item.photos?.length || 0;

                        return (
                          <article
                            key={item.progressId}
                            className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 shadow-sm transition-all hover:border-slate-300 hover:bg-white"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="min-w-0 text-sm font-black uppercase tracking-tight text-slate-950 sm:text-base">
                                    {item.activityName ||
                                      "Actividad sin nombre"}
                                  </h3>
                                  <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Unidad
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                  <span>Responsable</span>
                                  <span className="text-slate-700">
                                    {item.workerName || "Sin asignar"}
                                  </span>
                                </div>

                                {hasObs && (
                                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                                    <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                                      Observaciones
                                    </p>
                                    <div className="space-y-1">
                                      {item
                                        .observations!.split("|")
                                        .map((obs, index) => (
                                          <p
                                            key={index}
                                            className="text-[10px] font-medium leading-relaxed text-amber-700"
                                          >
                                            {obs.trim()}
                                          </p>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2 lg:w-[240px] lg:grid-cols-1">
                                <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Avance
                                  </span>
                                  <span className="text-2xl font-black leading-none tracking-tight text-slate-950">
                                    {item.reportedQuantity % 1 === 0
                                      ? item.reportedQuantity
                                      : item.reportedQuantity.toFixed(1)}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedProgressItem((prev) =>
                                      prev?.progressId === item.progressId
                                        ? null
                                        : item,
                                    )
                                  }
                                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-950 active:scale-95"
                                >
                                  <div className="relative">
                                    <ImageIcon className="size-3.5" />
                                    {photosCount > 0 && (
                                      <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full border border-white bg-emerald-500 text-[7px] font-black">
                                        {photosCount}
                                      </span>
                                    )}
                                  </div>
                                  {selectedProgressItem?.progressId ===
                                  item.progressId
                                    ? "Ocultar"
                                    : "Galería"}
                                </button>
                              </div>
                            </div>

                            {selectedProgressItem?.progressId ===
                              item.progressId && (
                              <div className="mt-4 border-t border-slate-200 pt-4">
                                <WorkOrderProgressPhotos progressItem={item} />
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Modal>
    </>
  );
}
