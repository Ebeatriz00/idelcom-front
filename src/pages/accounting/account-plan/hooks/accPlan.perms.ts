import { useAuthPerms } from "@/sharedKernel";

export function useAccPlanPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewAccPlan =
    !isLoading && has("catalogs_account_plan", "view_module");
  const canViewAllAccPlan =
    !isLoading && has("catalogs_account_plan", "all_list");

  /*ACCIONES*/
  const canCreateAccPlan = !isLoading && has("catalogs_account_plan", "create");
  const canEditAccPlan = !isLoading && has("catalogs_account_plan", "edit");
  const canEditStatusAccPlan =
    !isLoading && has("catalogs_account_plan", "edit_status");
  const canDeleteAccPlan =
    !isLoading && has("catalogs_account_plan", "eliminate");
  const canExportAccPlan = !isLoading && has("catalogs_account_plan", "export");

  return {
    isLoadingPerms: isLoading,
    canViewAccPlan,
    canViewAllAccPlan,
    canCreateAccPlan,
    canEditAccPlan,
    canEditStatusAccPlan,
    canDeleteAccPlan,
    canExportAccPlan,
  };
}
