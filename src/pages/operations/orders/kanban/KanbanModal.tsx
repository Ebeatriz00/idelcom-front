import { Modal } from "@/layouts";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import type { OperationsWorkOrderResponseDto } from "@/application/dtos/operations/workOrder/workOrder.dto";
import { SquadList } from "../squads/SquadList";
import {
  Users,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  PencilLine,
  ChevronDown,
  ChevronUp,
  Activity,
  Plus,
} from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSquad, useOperationsWorkOrderProgressList, useWorkOrderActivityList, useCreateOperationsWorkOrderProgress } from "@/sharedKernel";
import { useState, useMemo } from "react";
import type { OperationsSquadResponseDto } from "@/application";

type Props = {
  selectedOrder: OrdersResponseDto;
  filteredWorkOrders: OperationsWorkOrderResponseDto[];
  loadingWorkOrders: boolean;
  assignmentData: any;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
  totalPagesWO: number;
  onClose: () => void;
  onOpenWorkOrder: (operationsId: number, wo?: OperationsWorkOrderResponseDto) => void;
  onOpenSquad: (workOrderId: number) => void;
  onAddMember: (squadId: number) => void;
  onEditCrew: (woId: number, data: any) => void;
  onDeleteMember: (assignmentId: number) => void;
};

export function KanbanModal({
  selectedOrder,
  filteredWorkOrders,
  loadingWorkOrders,
  assignmentData,
  pagination,
  setPagination,
  totalPagesWO,
  onClose,
  onOpenWorkOrder,
  onOpenSquad,
  onAddMember,
  onEditCrew,
  onDeleteMember,
}: Props) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateSquad } = useUpdateSquad();

  const { data: progressData } = useOperationsWorkOrderProgressList(
    1,
    5000,
    undefined,
    "",
    undefined,
    selectedOrder?.operationsId ?? 0,
  );
  const allProgressData = progressData?.items || [];


  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const squadId = Number(draggableId);
    const newWorkOrderId = Number(destination.droppableId);

    let draggedSquad: OperationsSquadResponseDto | undefined;
    const allSquadQueries = queryClient.getQueriesData({ queryKey: ["operations", "squad"] });

    for (const [, data] of allSquadQueries) {
      if (data && (data as any).items) {
        const found = (data as any).items.find((s: any) => s.squadId === squadId);
        if (found) {
          draggedSquad = found;
          break;
        }
      }
    }

    if (draggedSquad) {
      await updateSquad({
        squadId: draggedSquad.squadId,
        workOrderId: newWorkOrderId,
        squadName: draggedSquad.squadName,
        techLeaderId: draggedSquad.techLeaderId,
        description: draggedSquad.description,
        operationsProjectConfigId: draggedSquad.operationsProjectConfigId,
        squadCategory: draggedSquad.squadCategory,
      });
    }
  };

  return (
    <Modal
      title={`Órdenes y Cuadrillas - ${selectedOrder?.opporDesc}`}
      onClose={onClose}
      size="full"
      contentClassName="!w-[100vw] !max-w-[100vw] !h-[100dvh] !max-h-[100dvh] sm:!w-[98vw] sm:!max-w-[98vw] sm:!h-[96vh] sm:!max-h-[96vh]"
      bodyClassName="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-slate-200/60 p-0 xl:overflow-hidden"
    >
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4 lg:p-6">
        <AsyncState
          isLoading={loadingWorkOrders}
          isEmpty={filteredWorkOrders.length === 0}
          emptyMessage="No hay registros de ejecución para esta operación"
        >
          <div className="flex flex-col h-full min-h-0">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex flex-col gap-4 overflow-visible pb-4 flex-1 items-stretch min-h-0 xl:flex-row xl:gap-6 xl:overflow-x-auto xl:snap-x">
              {filteredWorkOrders.map((wo) => (
                <div key={wo.workOrderId} className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md xl:min-w-[400px] xl:max-w-[400px] xl:shrink-0 xl:snap-center">
                  <div className="shrink-0 border-b border-gray-100 bg-slate-50/50 p-4 sm:p-5 xl:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex w-full min-w-0 flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="w-fit rounded border border-orange-100/50 bg-orange-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-orange-600">
                                {wo.workOrderCode}
                              </span>
                              <button
                                onClick={() => onOpenWorkOrder(selectedOrder!.operationsId!, wo)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-[#1A3673] hover:text-[#1A3673]"
                                aria-label="Gestionar orden"
                              >
                                <PencilLine className="size-3.5" />
                                Gestionar
                              </button>
                            </div>
                            <span className="text-[10px] font-black text-[#1A3673]">{wo.progressPercentage ?? 0}%</span>
                          </div>
                          <h4 className="truncate text-[14px] font-black leading-tight tracking-tight text-slate-900" title={wo.workOrderName}>
                            {wo.workOrderName}
                          </h4>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#1A3673] rounded-full transition-all duration-700"
                              style={{ width: `${wo.progressPercentage ?? 0}%` }}
                            />
                          </div>
                          
                          <WorkOrderActivitiesAccordion workOrderId={wo.workOrderId} allProgressData={allProgressData} />
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenSquad(wo.workOrderId)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#1A3673] shadow-sm transition-all active:scale-95 hover:border-[#1A3673] hover:bg-blue-50/30"
                      >
                        <Users className="size-3.5" />
                        Añadir Cuadrilla
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30 p-3 sm:p-4">
                    <SquadList
                      workOrderId={wo.workOrderId}
                      assignmentData={assignmentData}
                      onAddCrew={onOpenSquad}
                      onAddMember={onAddMember}
                      onEditCrew={onEditCrew}
                      onDeleteMember={onDeleteMember}
                    />
                  </div>
                </div>
              ))}

              {filteredWorkOrders.length === 0 && (
                <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <ClipboardList className="size-10 text-slate-300 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin órdenes registradas</p>
                </div>
              )}
            </div>
            </DragDropContext>

            {totalPagesWO > 1 && (
              <div className="mt-4 flex shrink-0 flex-col items-start gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Mostrando pág {pagination.pageIndex + 1} de {totalPagesWO}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.pageIndex === 0}
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-slate-500 shadow-sm transition-all hover:text-slate-900 disabled:opacity-30"
                  >
                    <ChevronLeft className="size-4" /> Anterior
                  </button>
                  <button
                    disabled={pagination.pageIndex === totalPagesWO - 1}
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-slate-500 shadow-sm transition-all hover:text-slate-900 disabled:opacity-30"
                  >
                    Siguiente <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </AsyncState>
      </div>
    </Modal>
  );
}

const WorkOrderActivitiesAccordion = ({ workOrderId, allProgressData }: { workOrderId: number, allProgressData: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: reportProgress, isPending: isReporting } = useCreateOperationsWorkOrderProgress();

  const [selectedActivityForProgress, setSelectedActivityForProgress] = useState<any | null>(null);
  const [reportedQty, setReportedQty] = useState<string>("");

  const handleReportProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityForProgress) return;
    const qty = parseFloat(reportedQty);
    if (isNaN(qty) || qty <= 0) return;

    try {
      await reportProgress({
        activityId: selectedActivityForProgress.id,
        reportedQuantity: qty,
        reportedDate: new Date().toISOString(),
      });
      
      setSelectedActivityForProgress(null);
      setReportedQty("");
    } catch (error) {
      console.error("Error reporting progress", error);
    }
  };

  const { data: activitiesData } = useWorkOrderActivityList(
    workOrderId,
    0,
    5000,
    ""
  );
  const allActivitiesData = activitiesData?.items || [];

  const activitiesMap = useMemo(() => {
    if (!allActivitiesData || allActivitiesData.length === 0) return new Map();
    const map = new Map<number, any>();
    
    // Filtramos las actividades base para esta WorkOrder
    const woActivities = allActivitiesData.filter(a => a.workOrderId === workOrderId);
    const woReports = allProgressData ? allProgressData.filter(r => r.workOrderId === workOrderId) : [];

    // Ordenar los reportes del más antiguo al más reciente
    const sortedReports = [...woReports].sort((a, b) => 
      new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime()
    );

    // 1. Construir la estructura base de actividades desde el maestro (incluye todo, tenga o no progreso)
    woActivities.forEach(act => {
      if (!act.parentActivityId) {
        if (!map.has(act.activityId)) {
          map.set(act.activityId, {
            id: act.activityId,
            name: act.activityName,
            percentage: act.progressPercentage || 0,
            currentQty: act.currentQuantity || 0,
            targetQty: act.targetQuantity || 0,
            subActivities: new Map<number, any>()
          });
        }
      }
    });

    // 2. Construir la estructura base de subactividades
    woActivities.forEach(act => {
      if (act.parentActivityId) {
        const parent = map.get(act.parentActivityId);
        if (parent) {
          parent.subActivities.set(act.activityId, {
            id: act.activityId,
            name: act.activityName,
            percentage: act.progressPercentage || 0,
            currentQty: act.currentQuantity || 0,
            targetQty: act.targetQuantity || 0
          });
        }
      }
    });

    // 3. Superponer los últimos reportes para mayor precisión en tiempo real
    sortedReports.forEach(item => {
      const parent = map.get(item.activityId);
      if (!parent) return;

      // Extraemos el porcentaje de la actividad padre que viene del back
      if (item.activityProgressPercentage !== undefined && item.activityProgressPercentage !== null) {
        parent.percentage = item.activityProgressPercentage;
      }

      if (!item.subActivityId) {
        parent.currentQty = item.currentQuantity || 0;
        parent.targetQty = item.targetQuantity || parent.targetQty;
        // Si el reporte es directo al padre y no tiene activityProgressPercentage, calculamos como respaldo
        if ((item.activityProgressPercentage === undefined || item.activityProgressPercentage === null) && parent.targetQty > 0) {
          parent.percentage = Math.min(100, Math.round((Number(parent.currentQty) / parent.targetQty) * 100));
        }
      } else {
        const sub = parent.subActivities.get(item.subActivityId);
        if (sub) {
          sub.currentQty = item.currentQuantity || 0;
          sub.targetQty = item.targetQuantity || sub.targetQty;
          sub.percentage = sub.targetQty ? Math.min(100, Math.round((Number(sub.currentQty) / sub.targetQty) * 100)) : 0;
        }
      }
    });

    // 4. Calcular el progreso del padre en base a sus hijos, contando TODOS sus hijos reales.
    map.forEach(act => {
      const subs = Array.from((act.subActivities as Map<number, any>).values());
      if (subs.length > 0) {
        const completedSubs = subs.filter((s: any) => s.percentage >= 100).length;
        act.isCalculatedBySubs = true;
        act.completedSubs = completedSubs;
        act.totalSubs = subs.length; // Aquí ya están contadas las subactividades en cero
      } else {
        act.isCalculatedBySubs = false;
      }
    });

    return map;
  }, [allProgressData, allActivitiesData, workOrderId]);

  const formatQty = (q: number) => q % 1 === 0 ? q : Number(q).toFixed(1);

  const activities = Array.from(activitiesMap.values());
  if (activities.length === 0) return null;

  return (
    <div className="mt-2 w-full">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
      >
        <span className="flex items-center gap-1.5"><Activity className="size-3" /> Ver detalles de avance ({activities.length})</span>
        {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
      
      {isOpen && (
        <div className="mt-1 flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-inner">
          {activities.map(act => {
            const subs = Array.from((act.subActivities as Map<number, any>).values());
            return (
              <div key={act.id} className="flex flex-col gap-1">
                <div className="flex flex-col justify-center rounded bg-slate-50 px-2.5 py-2 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9.5px] font-bold text-slate-700 truncate mr-2" title={act.name}>{act.name}</span>
                    <span className="shrink-0 text-[9px] font-black text-[#1A3673] flex items-center">
                      {!act.isCalculatedBySubs && act.percentage < 100 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActivityForProgress(act);
                            setReportedQty("");
                          }}
                          className="mr-2 inline-flex items-center justify-center rounded-full bg-blue-100 p-1 text-[#1A3673] transition-colors hover:bg-blue-200"
                          title="Reportar avance"
                        >
                          <Plus className="size-2.5" />
                        </button>
                      )}
                      {act.percentage >= 100 
                        ? `COMPLETO${act.isCalculatedBySubs ? ` (${act.totalSubs}/${act.totalSubs})` : act.targetQty > 0 ? ` (${formatQty(act.targetQty)}/${formatQty(act.targetQty)})` : ''}` 
                        : act.isCalculatedBySubs 
                          ? `${act.completedSubs}/${act.totalSubs} - ${act.percentage}%`
                          : act.targetQty > 0 
                            ? `${formatQty(act.currentQty)}/${formatQty(act.targetQty)} - ${act.percentage}%`
                            : `${act.percentage}%`}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A3673] rounded-full transition-all duration-700"
                      style={{ width: `${act.percentage}%` }}
                    />
                  </div>
                </div>
                {subs.map((sub: any) => (
                  <div key={sub.id} className="ml-4 flex flex-col justify-center rounded border border-slate-100 bg-white px-2.5 py-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8.5px] font-semibold text-slate-500 truncate mr-2" title={sub.name}>└ {sub.name}</span>
                      <span className="shrink-0 text-[8.5px] font-black text-[#1A3673]/80 flex items-center">
                        {sub.percentage < 100 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivityForProgress(sub);
                              setReportedQty("");
                            }}
                            className="mr-2 inline-flex items-center justify-center rounded-full bg-blue-100 p-0.5 text-[#1A3673] transition-colors hover:bg-blue-200"
                            title="Reportar avance"
                          >
                            <Plus className="size-2.5" />
                          </button>
                        )}
                        {sub.percentage >= 100 
                          ? `COMPLETO${sub.targetQty > 0 ? ` (${formatQty(sub.targetQty)}/${formatQty(sub.targetQty)})` : ''}`
                          : sub.targetQty > 0 
                            ? `${formatQty(sub.currentQty)}/${formatQty(sub.targetQty)} - ${sub.percentage}%`
                            : `${sub.percentage}%`}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A3673] rounded-full transition-all duration-700 opacity-70"
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {selectedActivityForProgress && (
        <Modal
          title="Reportar avance"
          onClose={() => {
            setSelectedActivityForProgress(null);
            setReportedQty("");
          }}
          size="sm"
        >
          <form onSubmit={handleReportProgress} className="p-4 sm:p-5">
            <p className="mb-4 text-xs font-semibold text-slate-700 line-clamp-2" title={selectedActivityForProgress.name}>
              {selectedActivityForProgress.name}
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Progreso actual
              </label>
              <p className="text-sm font-bold text-slate-900">
                {formatQty(selectedActivityForProgress.currentQty)} de {formatQty(selectedActivityForProgress.targetQty)}
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="reportedQty" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Cantidad a sumar
              </label>
              <input
                id="reportedQty"
                type="number"
                step="any"
                min="0.01"
                max={selectedActivityForProgress.targetQty > 0 ? selectedActivityForProgress.targetQty - selectedActivityForProgress.currentQty : undefined}
                required
                autoFocus
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#1A3673] focus:ring-1 focus:ring-[#1A3673]"
                value={reportedQty}
                onChange={(e) => setReportedQty(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedActivityForProgress(null);
                  setReportedQty("");
                }}
                className="rounded-md px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isReporting || !reportedQty || parseFloat(reportedQty) <= 0}
                className="rounded-md bg-[#1A3673] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#132856] disabled:opacity-50"
              >
                {isReporting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
