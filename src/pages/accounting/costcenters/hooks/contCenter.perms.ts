import { useAuthPerms } from "@/sharedKernel";

export function useAccCostCenterPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewCostCenter =
    !isLoading && has("catalogs_cost_centers", "view_module");
  const canViewAllCostCenter =
    !isLoading && has("catalogs_cost_centers", "all_list");

  /*ACCIONES*/
  const canCreateCostCenter =
    !isLoading && has("catalogs_cost_centers", "create");
  const canEditCostCenter = !isLoading && has("catalogs_cost_centers", "edit");
  const canEditStatusCostCenter =
    !isLoading && has("catalogs_cost_centers", "edit_status");
  const canDeleteCostCenter =
    !isLoading && has("catalogs_cost_centers", "eliminate");
  const canExportCostCenter =
    !isLoading && has("catalogs_cost_centers", "export");

  return {
    isLoadingPerms: isLoading,
    canViewCostCenter,
    canViewAllCostCenter,
    canCreateCostCenter,
    canEditCostCenter,
    canEditStatusCostCenter,
    canDeleteCostCenter,
    canExportCostCenter,
  };
}
