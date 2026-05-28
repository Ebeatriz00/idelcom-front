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
  Pencil,
} from "lucide-react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
    
    for (const [key, data] of allSquadQueries) {
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
      contentClassName="!max-w-[98vw] !w-[98vw] !h-[96vh] !max-h-[96vh]"
      bodyClassName="p-0 bg-slate-200/60 flex-1 overflow-hidden flex flex-col"
    >
      <div className="h-full flex flex-col p-4 sm:p-6 min-h-0">
        <AsyncState
          isLoading={loadingWorkOrders}
          isEmpty={filteredWorkOrders.length === 0}
          emptyMessage="No hay registros de ejecución para esta operación"
        >
          <div className="flex flex-col h-full min-h-0">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-stretch snap-x min-h-0">
              {filteredWorkOrders.map((wo) => (
                <div key={wo.workOrderId} className="min-w-[400px] max-w-[400px] shrink-0 flex flex-col bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden h-full snap-center">
                  <div className="p-5 border-b border-gray-100 bg-slate-50/50 shrink-0">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2 min-w-0 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-fit text-[8px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded border border-orange-100/50">
                                {wo.workOrderCode}
                              </span>
                              <button
                                onClick={() => onOpenWorkOrder(selectedOrder!.operationsId!, wo)}
                                className="p-1 text-slate-300 hover:text-[#1A3673] transition-colors"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-black text-[#1A3673]">{wo.progressPercentage ?? 0}%</span>
                          </div>
                          <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-tight truncate" title={wo.workOrderName}>
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
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-[#1A3673] rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-[#1A3673] hover:bg-blue-50/30 transition-all active:scale-95 shadow-sm"
                      >
                        <Users className="size-3.5" />
                        Añadir Cuadrilla
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/30 flex-1 overflow-y-auto min-h-0">
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
                <div className="w-full flex flex-col items-center justify-center p-12 text-center h-[300px] border-2 border-dashed border-gray-200 rounded-xl">
                  <ClipboardList className="size-10 text-slate-300 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin órdenes registradas</p>
                </div>
              )}
            </div>
            </DragDropContext>

            {totalPagesWO > 1 && (
              <div className="flex items-center justify-end pt-4 mt-4 border-t border-gray-200 gap-4 shrink-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Mostrando pág {pagination.pageIndex + 1} de {totalPagesWO}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.pageIndex === 0}
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft className="size-4" /> Anterior
                  </button>
                  <button
                    disabled={pagination.pageIndex === totalPagesWO - 1}
                    onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm"
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
