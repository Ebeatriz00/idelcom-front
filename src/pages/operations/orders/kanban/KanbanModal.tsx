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
} from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSquad } from "@/sharedKernel";
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
