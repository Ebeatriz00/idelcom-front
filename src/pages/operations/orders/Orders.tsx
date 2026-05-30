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
  PanelLeftOpen,
  ListOrdered,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useOrdersPerms } from "./utils/order.perm";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponseDto | null>(() => {
    const saved = localStorage.getItem("lastSelectedOrder");
    return saved ? JSON.parse(saved) : null;
  });
  const [, setActiveWorkOrder] = useState<any | null>(null);
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false);
  const [activeMobilePane, setActiveMobilePane] = useState<"orders" | "detail">(
    selectedOrder ? "detail" : "orders",
  );
  const [isMobilePaneMode, setIsMobilePaneMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 639px), (max-height: 500px) and (orientation: landscape)").matches;
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 });
  const [searchWorkOrder] = useState("");
  const [activeShiftTab, setActiveShiftTab] = useState(0);
  const debouncedSearchWO = useDebouncedValue(searchWorkOrder, 400);
  const {
    canEditAppConfiguration,
    canEditGeneralProjectAjustment,
    canEditSsomaTeam,
    canConfigManagerSquadAdmin,
    canCreateOrdersWorker,
  } = useOrdersPerms();

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem("lastSelectedOrder", JSON.stringify(selectedOrder));
      setActiveMobilePane("detail");
    } else {
      localStorage.removeItem("lastSelectedOrder");
      setActiveMobilePane("orders");
    }
  }, [selectedOrder]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px), (max-height: 500px) and (orientation: landscape)");
    const updatePaneMode = () => setIsMobilePaneMode(query.matches);

    updatePaneMode();
    query.addEventListener("change", updatePaneMode);

    return () => query.removeEventListener("change", updatePaneMode);
  }, []);

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
    <div className="min-h-screen max-w-full flex flex-col relative overflow-x-hidden bg-[#f6f8fb] p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "Gestión de Órdenes", current: true },
        ]}
      />

      {selectedOrder && isMobilePaneMode && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
            Vista
          </label>
          <div className="relative">
            {activeMobilePane === "detail" ? (
              <LayoutDashboard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700" />
            ) : (
              <ListOrdered className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700" />
            )}
            <select
              value={activeMobilePane}
              onChange={(event) => setActiveMobilePane(event.target.value as "orders" | "detail")}
              className="min-h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-10 py-3 text-[11px] font-black uppercase tracking-widest text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="detail">Detalle de orden</option>
              <option value="orders">Lista de ordenes</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] gap-4 lg:gap-6 flex-1 min-w-0 items-start">
        <div className={selectedOrder && isMobilePaneMode && activeMobilePane !== "orders" ? "hidden" : "block"}>
          <AsideOrders
            selectedId={selectedOrder?.operationsId}
            onSelect={(order) => {
              setSelectedOrder(order);
              setActiveMobilePane("detail");
            }}
          />
        </div>

        <main className={selectedOrder && isMobilePaneMode && activeMobilePane !== "detail" ? "hidden min-w-0 h-full" : "min-w-0 h-full"}>
          {selectedOrder ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">

              <OrderHeader
                selectedOrder={selectedOrder}
                opDetail={opDetail}
                isMobilePaneMode={isMobilePaneMode}
                hasAdditionals={!!hasAdditionals}
                existingSsomaId={existingSsomaId}
                onOpenAdditionals={(opporId) => additionalOrdersModal.openModal(opporId)}
                onOpenSettings={(operationsId) => operationsSettingsModal.openModal(operationsId)}
                onOpenSsomaProcess={(operationsId, opporDesc, dates, ssomaId) =>
                  ssomaProcessModal.openModal(operationsId, opporDesc, dates, ssomaId)
                }
                onOpenHistory={(operationsId, orderData) => workOrderProgressModal.openModal(operationsId, orderData)}
                canEditGeneralProjectAjustment={canEditGeneralProjectAjustment}
                canEditSsomaTeam={canEditSsomaTeam}
              />

              <div className="p-4 sm:p-5 lg:p-6 xl:p-8 space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 2xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.6fr)] gap-4 lg:gap-6 xl:gap-8">
                  <ScheduleSection opDetail={opDetail} />

                  <ShiftConfigSection
                    configsSorted={configsSorted}
                    projectConfig={projectConfig}
                    activeShiftTab={activeShiftTab}
                    setActiveShiftTab={setActiveShiftTab}
                    onOpenProjectConfig={(operationsId) => projectConfigModal.openModal(operationsId)}
                    operationsId={selectedOrder!.operationsId!}
                    canEditAppConfiguration={canEditAppConfiguration}
                  />
                </div>

                <div className="pt-6 lg:pt-8 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase leading-tight">
                      Gestión Operativa de Cuadrillas
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Cuadrillas, actividades, subactividades y personal
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => setIsAdminManagerOpen(true)}
                      className={`min-h-11 justify-center flex items-center gap-1.5 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all shadow-sm active:scale-95 ${
                        canConfigManagerSquadAdmin
                          ? "bg-cyan-50 border border-cyan-200 text-cyan-900 hover:bg-cyan-100"
                          : "bg-cyan-50/70 border border-cyan-100 text-cyan-800 hover:bg-cyan-50"
                      }`}
                    >
                      <Users className="size-3.5" />
                      Personal del Proyecto
                    </button>
                    {canCreateOrdersWorker && (
                      <button
                        onClick={() => workOrderModal.openModal(selectedOrder!.operationsId!)}
                        className="min-h-11 justify-center flex items-center gap-1.5 px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all shadow-sm active:scale-95"
                      >
                        <ClipboardList className="size-3.5" />
                        Nueva Orden
                      </button>
                    )}
                    <button
                      onClick={() => setIsKanbanModalOpen(true)}
                      className="min-h-11 justify-center flex items-center gap-2 px-5 py-3 bg-[#1A3673] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#132856] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                    >
                      <Users className="size-4" />
                      Ver Órdenes y Cuadrillas
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[460px] lg:min-h-[620px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-6 sm:p-10 lg:p-12 text-center shadow-inner">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative p-7 sm:p-9 lg:p-10 bg-slate-950 rounded-lg shadow-2xl text-white">
                  <ClipboardList className="size-14 sm:size-16 lg:size-20 opacity-80" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3 lg:mb-4">Gestión de Operaciones</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-bold text-xs sm:text-sm leading-relaxed uppercase tracking-wider">Selecciona una orden para revisar cronograma, responsables y cuadrillas.</p>
              <div className="mt-6 lg:mt-8 flex items-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-[0.2em]"><PanelLeftOpen className="size-4" />Panel de ordenes</div>
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
        readOnly={!canConfigManagerSquadAdmin}
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
        readOnly={!canEditAppConfiguration}
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
        readOnly={!canEditSsomaTeam}
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
