import { useAuthPerms } from "@/sharedKernel";

export function useOrdersPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewAllOrders = !isLoading && has("services_orders", "all_list");

  const canViewFilteredOrders =
    !isLoading && has("services_orders", "list_service_orders_filtered");
  const canViewFilteredWorkerOrders =
    !isLoading && has("services_orders", "list_filtered_worker_order");
  const canViewFilteredActivityOrders =
    !isLoading &&
    has("services_orders", "list_filtered_activity_progress_history");

  /*ACCIONES - exportar*/
  const canExportOrders = !isLoading && has("services_orders", "export");

  /*ACCION ORDENES*/
  const canCreateOrdersWorker =
    !isLoading && has("services_orders", "create_new_work_order");
  const canEditOrdersWorker =
    !isLoading && has("services_orders", "edit_work_order");

  const canAddPersonnelSquad =
    !isLoading && has("services_orders", "add_personnel_to_operational_squad");
  const canEditPersonnelSquad =
    !isLoading && has("services_orders", "edit_perational_squad");
  const canRemovePersonnelSquad =
    !isLoading &&
    has("services_orders", "remove_personnel_from_operational_squad");

  const canConfigManagerSquadAdmin =
    !isLoading && has("services_orders", "manage_project_administrative_squad");

  const canEditGeneralProjectAjustment =
    !isLoading && has("services_orders", "edit_general_project_adjustment");
  const canEditSsomaTeam =
    !isLoading && has("services_orders", "edit_ssoma_team");
  const canEditProjectConfiguration =
    !isLoading && has("services_orders", "edit_project_configuration");

  return {
    isLoadingPerms: isLoading,
    canViewAllOrders,
    canViewFilteredOrders,
    canViewFilteredActivityOrders,
    canExportOrders,
    canCreateOrdersWorker,
    canEditOrdersWorker,
    canRemovePersonnelSquad,
    canAddPersonnelSquad,
    canEditPersonnelSquad,
    canConfigManagerSquadAdmin,
    canEditGeneralProjectAjustment,
    canEditSsomaTeam,
    canEditProjectConfiguration,
    canViewFilteredWorkerOrders,
  };
}
