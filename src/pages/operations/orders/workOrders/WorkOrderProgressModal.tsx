import { Modal } from "@/layouts";
import { useOperationsWorkOrderProgressList, useWorkOrderActivitySelect, showApiError } from "@/sharedKernel";
import { fetchOperationsWorkOrderProgressReport } from "@/infrastructure";
import { exportExcel } from "@/sharedKernel/utils/export/exportsGeneric";
import type { ColumnSpec } from "@/sharedKernel";
import { Loader2, ClipboardCheck, Users, Image as ImageIcon, ChevronRight, ChevronLeft, Download } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WorkOrderProgressPhotos } from "./WorkOrderProgressPhotos";
import type { OperationsWorkOrderProgressResponseDto } from "@/application";

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

export function WorkOrderProgressModal({
  open,
  onClose,
  operationsId,
  activityId,
  selectedOrder
}: Props) {
  const [view, setView] = useState<ViewType>("dia");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<number | null>(activityId || null);
  const [selectedProgressItem, setSelectedProgressItem] = useState<OperationsWorkOrderProgressResponseDto | null>(null);

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
    const walk = (x - startX.current) * 2; // velocidad de scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const { data: activitiesData } = useWorkOrderActivitySelect(operationsId ?? 0, 1, 500, "");
  const activitiesList = activitiesData?.items || [];

  const { data, isLoading } = useOperationsWorkOrderProgressList(
    1,
    500,
    undefined,
    "",
    undefined,
    operationsId ?? 0
  );

  const allItems = data?.items || [];

  const activityItems = useMemo(() => {
    let filtered = allItems;
    if (selectedActivityFilter) {
      filtered = allItems.filter(item => item.activityId === selectedActivityFilter);
    }

    const byActivity: Record<number, typeof filtered> = {};
    filtered.forEach(item => {
      if (!byActivity[item.activityId]) byActivity[item.activityId] = [];
      byActivity[item.activityId].push(item);
    });

    let calculated: typeof filtered = [];

    Object.values(byActivity).forEach(items => {
      let accumulated = 0;
      const reversed = [...items].reverse();
      const withRunningTotal = reversed.map(item => {
        accumulated += (item.reportedQuantity || 0);
        return { ...item, runningTotal: accumulated };
      });
      calculated = [...calculated, ...withRunningTotal];
    });

    return calculated.sort((a, b) => b.progressId - a.progressId);
  }, [allItems, selectedActivityFilter]);

  const availableDates = useMemo(() => {
    const dates = activityItems.map(item => item.reportedDate.split("T")[0]);
    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  }, [activityItems]);

  useEffect(() => {
    if (open && availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [open, availableDates, selectedDate]);

  const displayedItems = useMemo(() => {
    if (view === "dia") {
      return activityItems.filter(item => item.reportedDate.split("T")[0] === selectedDate);
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

    const uniquePersons = new Set(activityItems.map((i) => i.workerName).filter(Boolean)).size;

    return {
      count: activityItems.length,
      persons: uniquePersons,
      current: currentQty % 1 === 0 ? currentQty : Number(currentQty).toFixed(1),
      target: targetQty % 1 === 0 ? targetQty : Number(targetQty).toFixed(1),
      percentage,
      hasTarget: targetQty > 0
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

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return { day: 0, month: "", full: "", monthFull: "" };
    const [y, m, d] = dateStr.split("-");
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const monthsFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return {
      day: parseInt(d),
      month: months[parseInt(m) - 1],
      monthFull: `${monthsFull[parseInt(m) - 1]} ${y}`,
      full: `${parseInt(d)} ${months[parseInt(m) - 1]}`,
    };
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
        title=""
        size="4xl"
        hideCloseButton={true}
        hidden={selectedProgressItem !== null}
        footer={
          <div className="flex justify-end px-4 py-2 border-t border-slate-100 bg-white w-full rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              Cerrar Historial
            </button>
          </div>
        }
      >
        <div className="flex h-[700px] bg-white overflow-hidden rounded-t-xl">
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">
                      Operaciones / Avances
                    </p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      Historial de Reportes
                    </h1>
                  </div>
                  <div className="flex gap-1 bg-slate-50/50 p-1 rounded-lg border border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => setView("dia")}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        view === "dia" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Día
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("semana")}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        view === "semana" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Todo
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="w-full md:max-w-md">
                      <select
                        value={selectedActivityFilter || ""}
                        onChange={(e) => setSelectedActivityFilter(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-lg px-4 py-3 focus:outline-none focus:border-slate-400 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">Todas las actividades</option>
                        {activitiesList.map((act: any) => (
                          <option key={act.activityId} value={act.activityId}>
                            {act.activityName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                      <button
                          type="button"
                          onClick={handleExportExcel}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 hover:text-emerald-700 transition-all shadow-sm active:scale-95"
                        >
                          <Download className="size-3.5" />
                          Excel
                        </button>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reportes</span>
                        <span className="text-xl font-black text-slate-900 leading-tight">{stats.count}</span>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200/80 hidden md:block"></div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personal</span>
                          <span className="text-xl font-black text-slate-900 leading-tight">{stats.persons}</span>
                        </div>
                        <div className="size-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <Users className="size-5 text-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {view === "dia" && availableDates.length > 0 && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => scrollByAmount(-150)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm shrink-0 active:scale-95 z-10 flex items-center justify-center h-[34px]"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-2 overflow-x-auto cursor-grab active:cursor-grabbing items-center"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <style>{`.cursor-grab::-webkit-scrollbar { display: none; }`}</style>
                        {availableDates.map(date => {
                          const { day, month } = formatDateLabel(date);
                          const isActive = date === selectedDate;
                          return (
                            <button
                              key={date}
                              onClick={(e) => {
                                // Prevent click if we were dragging
                                if (isDragging.current && startX.current !== (e.pageX - (scrollContainerRef.current?.offsetLeft || 0))) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                } else {
                                  setSelectedDate(date);
                                }
                              }}
                              className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 select-none h-[34px] flex items-center justify-center",
                                isActive
                                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
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
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm shrink-0 active:scale-95 z-10 flex items-center justify-center h-[34px]"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline de Reportes */}
              <div className="relative pl-8">
                <div className="absolute left-2 top-0 bottom-0 w-[0.5px] bg-slate-200" />

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="size-6 animate-spin text-slate-300" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Sincronizando...</p>
                  </div>
                ) : displayedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <ClipboardCheck className="size-10 text-slate-200 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      No se encontraron registros
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12 pb-10">
                    {groupedItems.map(([date, group]) => (
                      <div key={date} className="relative space-y-6">
                        <div className="flex items-center gap-3 -ml-[31px]">
                          <div className="size-2.5 rounded-full bg-white border border-slate-300 z-10" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white pr-2">
                            {formatDateLabel(date).full}
                          </span>
                        </div>

                        <div className="space-y-4">
                          {group.map((item) => {
                            const hasObs = item.observations && item.observations !== "Sin observaciones";

                            return (
                              <div
                                key={item.progressId}
                                className="group relative"
                              >
                                <div className={cn(
                                  "absolute -left-[27px] top-4 size-1.5 rounded-full border border-white z-10 transition-all",
                                  hasObs ? "bg-amber-500" : item.reportedQuantity > 0 ? "bg-emerald-500" : "bg-slate-300"
                                )} />

                                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-4 transition-all hover:border-slate-300 hover:shadow-sm">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
                                        {item.activityName || "Actividad sin nombre"}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Responsable:</span>
                                        <span className="text-[9px] font-black text-slate-700 uppercase">
                                          {item.workerName || "Sin asignar"}
                                        </span>
                                      </div>
                                      {hasObs && (
                                        <div className="mt-2 space-y-1 p-2 bg-amber-50/50 rounded-md border border-amber-100/50">
                                          {item.observations!.split('|').map((obs, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                              <div className="size-1 rounded-full bg-amber-400 mt-1 shrink-0" />
                                              <p className="text-[10px] font-medium text-amber-700 leading-relaxed italic">
                                                {obs.trim()}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 min-w-[90px] pt-1">
                                    <div className="flex flex-col items-end mb-4">
                                      <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">
                                        {item.reportedQuantity % 1 === 0 ? item.reportedQuantity : item.reportedQuantity.toFixed(1)}
                                      </span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                                        Reportado
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProgressItem(item)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95"
                                    >
                                      <div className="relative">
                                        <ImageIcon className="size-3" />
                                        {item.photos && item.photos.length > 0 && (
                                          <span className="absolute -top-2 -right-2 size-3 bg-emerald-500 text-[7px] flex items-center justify-center rounded-full border border-white">
                                            {item.photos.length}
                                          </span>
                                        )}
                                      </div>
                                      <span>Fotos</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Modal>

      <WorkOrderProgressPhotos
        progressItem={selectedProgressItem}
        onClose={() => setSelectedProgressItem(null)}
      />

    </>
  );
}
