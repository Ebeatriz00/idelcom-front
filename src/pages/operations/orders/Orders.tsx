import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useEffect, useState } from "react";
import { AsideOrders } from "./sidebar/OrdersTable";
import { WorkOrderModal } from "./workOrders/WorkOrderModal";
import { useWorkOrderModal } from "./workOrders/useWorkOrderModal";
import { SquadModal } from "./squads/SquadModal";
import { useSquadModal } from "./squads/useSquadModal";
import { PersonnelAssignmentModal } from "./squads/PersonnelAssignmentModal";
import { usePersonnelAssignmentModal } from "./squads/usePersonnelAssignmentModal";
import { AdminSquadsManagerModal } from "./AdminSquadsManagerModal";
import { OperationsSettingsModal } from "./settings/OperationsSettingsModal";
import { useOperationsSettingsModal } from "./settings/useOperationsSettingsModal";
import { ProjectConfigModal } from "./settings/ProjectConfigModal";
import { useProjectConfigModal } from "./settings/useProjectConfigModal";
import { SsomaProcessRegisterModal } from "./ssoma/SsomaProcessRegisterModal";
import { useSsomaProcessRegisterModal } from "./ssoma/useSsomaProcessRegisterModal";
import { WorkOrderProgressModal } from "./workOrders/WorkOrderProgressModal";
import { useWorkOrderProgressModal } from "./workOrders/useWorkOrderProgressModal";
import { AdditionalOrdersModal } from "./_shared/AdditionalOrdersModal";
import { useAdditionalOrdersModal } from "./_shared/useAdditionalOrdersModal";
import { useOrdersList } from "@/sharedKernel/hooks/operations/orders/useOrders";
import {
  useAssignmentList,
  useConfigProjectById,
  useDeleteAssignment,
  useOperationsById,
  useWorkOrderList,
  useSsomaProcessList,
  confirmAction,
} from "@/sharedKernel";
import { useDebouncedValue } from "@/sharedKernel";
import { OrderHeader } from "./detail/OrderHeader";
import { ScheduleSection } from "./detail/ScheduleSection";
import { ShiftConfigSection } from "./detail/ShiftConfigSection";
import { KanbanModal } from "./kanban/KanbanModal";
import {
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponseDto | null>(() => {
    const saved = localStorage.getItem("lastSelectedOrder");
    return saved ? JSON.parse(saved) : null;
  });
  const [, setActiveWorkOrder] = useState<any | null>(null);
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 });
  const [searchWorkOrder] = useState("");
  const [activeShiftTab, setActiveShiftTab] = useState(0);
  const debouncedSearchWO = useDebouncedValue(searchWorkOrder, 400);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem("lastSelectedOrder", JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem("lastSelectedOrder");
    }
  }, [selectedOrder]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setActiveWorkOrder(null);
    setActiveShiftTab(0);
  }, [selectedOrder?.operationsId, debouncedSearchWO]);

  const { data: workOrdersData, isLoading: loadingWorkOrders } = useWorkOrderList(
    pagination.pageIndex,
    pagination.pageSize,
    selectedOrder?.operationsId,
    debouncedSearchWO,
  );

  const totalCount = workOrdersData?.total ?? 0;
  const totalPagesWO = Math.ceil(totalCount / pagination.pageSize);

  const { data: assignmentData } = useAssignmentList(0, 1000);
  const { mutateAsync: deleteAssignment } = useDeleteAssignment();

  const handleDeleteAssignment = async (id: number) => {
    const ok = await confirmAction({
      title: "¿Eliminar integrante?",
      text: "¿Estás seguro de que deseas retirar a este trabajador de la cuadrilla?",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar"
    });

    if (ok) {
      await deleteAssignment(id);
    }
  };

  const filteredWorkOrders = workOrdersData?.items || [];
  const { data: opDetail } = useOperationsById(selectedOrder?.operationsId);
  const { data: projectConfigs } = useConfigProjectById(selectedOrder?.operationsId || 0);

  // Ordenar configs por ID para consistencia visual
  const configsSorted = [...(projectConfigs || [])].sort((a, b) => (a.shift || 0) - (b.shift || 0));
  const projectConfig = configsSorted && configsSorted.length > 0
    ? (configsSorted[activeShiftTab] || configsSorted[0])
    : null;

  const { data: ssomaListData } = useSsomaProcessList(
    1,
    10,
    selectedOrder?.operationsId,
    "",
    !!selectedOrder?.operationsId,
  );
  const existingSsomaId = ssomaListData?.items?.[0]?.ssomaProcessId;

  const { data: allOrdersData } = useOrdersList(0, 500, "");
  const hasAdditionals = allOrdersData?.items?.some(order => order.parentOpportunityId === selectedOrder?.opporId);

  // Obtener TODAS las OTs de la operación para filtrar las cuadrillas admin por workOrderId
  const { data: allWorkOrdersData } = useWorkOrderList(0, 500, selectedOrder?.operationsId, "");
  const allWorkOrderIds = (allWorkOrdersData?.items || []).map((wo) => wo.workOrderId as number);

  const workOrderModal = useWorkOrderModal();
  const squadModal = useSquadModal();
  const personnelModal = usePersonnelAssignmentModal();
  const operationsSettingsModal = useOperationsSettingsModal(undefined, {
    selectedOrder,
    workOrders: filteredWorkOrders,
    assignmentData: assignmentData?.items || [],
    projectConfigs: projectConfigs || [],
    ssomaProcessId: existingSsomaId ?? null,
  });
  const projectConfigModal = useProjectConfigModal();
  const ssomaProcessModal = useSsomaProcessRegisterModal();
  const workOrderProgressModal = useWorkOrderProgressModal();
  const additionalOrdersModal = useAdditionalOrdersModal();

  return (
    <div className="min-h-screen max-w-full flex flex-col relative p-6 space-y-6 bg-slate-50/30 overflow-x-hidden">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "Gestión de Órdenes", current: true },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] gap-6 flex-1 min-w-0">
        <AsideOrders
          selectedId={selectedOrder?.operationsId}
          onSelect={(order) => setSelectedOrder(order)}
        />

        <main className="min-w-0 h-full">
          {selectedOrder ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">

              <OrderHeader
                selectedOrder={selectedOrder}
                opDetail={opDetail}
                hasAdditionals={!!hasAdditionals}
                existingSsomaId={existingSsomaId}
                onOpenAdditionals={(opporId) => additionalOrdersModal.openModal(opporId)}
                onOpenSettings={(operationsId) => operationsSettingsModal.openModal(operationsId)}
                onOpenSsomaProcess={(operationsId, opporDesc, dates, ssomaId) =>
                  ssomaProcessModal.openModal(operationsId, opporDesc, dates, ssomaId)
                }
                onOpenHistory={(operationsId, orderData) => workOrderProgressModal.openModal(operationsId, orderData)}
              />

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.8fr] gap-8">
                  <ScheduleSection opDetail={opDetail} />

                  <ShiftConfigSection
                    configsSorted={configsSorted}
                    projectConfig={projectConfig}
                    activeShiftTab={activeShiftTab}
                    setActiveShiftTab={setActiveShiftTab}
                    onOpenProjectConfig={(operationsId) => projectConfigModal.openModal(operationsId)}
                    operationsId={selectedOrder!.operationsId!}
                  />
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">
                      Gestión de Campo
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Órdenes de Trabajo y Cuadrillas
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => workOrderModal.openModal(selectedOrder!.operationsId!)}
                      className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                      <ClipboardList className="size-3.5" />
                      Nueva Orden
                    </button>
                    <button
                      onClick={() => setIsAdminManagerOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-3 bg-white border border-blue-200 text-blue-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                      <Users className="size-3.5" />
                      Cuadrillas Admin
                    </button>
                    <button
                      onClick={() => setIsKanbanModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1A3673] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#132856] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                    >
                      <Users className="size-4" />
                      Ver Órdenes y Cuadrillas
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[600px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-inner">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative p-10 bg-slate-950 rounded-xl shadow-2xl text-white">
                  <ClipboardList className="size-20 opacity-80" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Gestión de Operaciones</h3>
              <p className="text-slate-400 max-w-sm mx-auto font-bold text-sm leading-relaxed uppercase tracking-wider">Selecciona un registro lateral para comenzar</p>
              <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] animate-bounce"><ArrowRight className="size-4" />Esperando selección</div>
            </div>
          )}
        </main>
      </div>

      {isKanbanModalOpen && (
        <KanbanModal
          selectedOrder={selectedOrder!}
          filteredWorkOrders={filteredWorkOrders}
          loadingWorkOrders={loadingWorkOrders}
          assignmentData={assignmentData}
          pagination={pagination}
          setPagination={setPagination}
          totalPagesWO={totalPagesWO}
          onClose={() => setIsKanbanModalOpen(false)}
          onOpenWorkOrder={(operationsId, wo) => workOrderModal.openModal(operationsId, wo)}
          onOpenSquad={squadModal.openModal}
          onAddMember={personnelModal.openModal}
          onEditCrew={squadModal.openModal}
          onDeleteMember={handleDeleteAssignment}
        />
      )}
      <AdminSquadsManagerModal
        open={isAdminManagerOpen}
        onClose={() => setIsAdminManagerOpen(false)}
        operationsId={selectedOrder?.operationsId || 0}
        workOrderIds={allWorkOrderIds}
        onEditSquad={(squad) => squadModal.openModal(squad.workOrderId, squad)}
        onAddMember={(squadId) => personnelModal.openModal(squadId, true)}
      />
      <WorkOrderModal
        open={workOrderModal.open}
        onClose={workOrderModal.closeModal}
        onSubmit={workOrderModal.submit}
        saving={workOrderModal.saving}
        initialData={workOrderModal.initialData}
      />
      <SquadModal
        open={squadModal.open}
        onClose={squadModal.closeModal}
        onSubmit={squadModal.submit}
        saving={squadModal.saving}
        initialData={squadModal.initialData}
        operationsId={selectedOrder?.operationsId || 0}
      />
      <PersonnelAssignmentModal 
        open={personnelModal.open} 
        onClose={personnelModal.closeModal} 
        onSubmit={personnelModal.submit} 
        saving={personnelModal.saving} 
        operationsId={selectedOrder?.operationsId || 0}
        isAdministrative={personnelModal.isAdministrative}
      />
      <OperationsSettingsModal 
        open={operationsSettingsModal.open} 
        onClose={operationsSettingsModal.closeModal} 
        onSubmit={operationsSettingsModal.submit} 
        saving={operationsSettingsModal.saving} 
        initialData={operationsSettingsModal.initialData} 
      />
      <ProjectConfigModal
        open={projectConfigModal.open}
        onClose={projectConfigModal.closeModal}
        onSubmit={projectConfigModal.submit}
        saving={projectConfigModal.saving}
        initialData={projectConfigModal.initialData}
        allConfigs={projectConfigModal.allConfigs}
        hasExistingConfig={projectConfigModal.hasExistingConfig}
      />
      <SsomaProcessRegisterModal
        open={ssomaProcessModal.open}
        onClose={ssomaProcessModal.closeModal}
        onSubmit={ssomaProcessModal.submit}
        saving={ssomaProcessModal.saving}
        workOrderName={ssomaProcessModal.workOrderName}
        plannedDates={ssomaProcessModal.plannedDates}
        ssomaProcessId={ssomaProcessModal.ssomaProcessId}
        operationsId={selectedOrder?.operationsId || 0}
      />
      <WorkOrderProgressModal
        open={workOrderProgressModal.open}
        onClose={workOrderProgressModal.closeModal}
        operationsId={workOrderProgressModal.operationsId}
        selectedOrder={workOrderProgressModal.selectedOrder}
        activityId={workOrderProgressModal.activityId}
        targetQuantity={workOrderProgressModal.targetQuantity}
      />
      <AdditionalOrdersModal
        open={additionalOrdersModal.open}
        onClose={additionalOrdersModal.closeModal}
        opporId={additionalOrdersModal.opporId}
      />
    </div>
  );
}
