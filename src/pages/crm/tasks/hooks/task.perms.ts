import { useAuthPerms } from "@/sharedKernel";

export function useCrmOpporTaskPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewOpporTask =
    !isLoading && has("crm_opportunity_tasks", "view_module");
  const canViewAllOpporTask =
    !isLoading && has("crm_opportunity_tasks", "all_list");

  /*ACCIONES*/
  const canCreateOpporTask =
    !isLoading && has("crm_opportunity_tasks", "create");
  const canEditOpporTask = !isLoading && has("crm_opportunity_tasks", "edit");
  const canEditStatusOpporTask =
    !isLoading && has("crm_opportunity_tasks", "edit_status");
  const canDeleteOpporTask =
    !isLoading && has("crm_opportunity_tasks", "eliminate");
  const canExportOpporTask =
    !isLoading && has("crm_opportunity_tasks", "export");

  return {
    isLoadingPerms: isLoading,
    canViewOpporTask,
    canViewAllOpporTask,
    canCreateOpporTask,
    canEditOpporTask,
    canEditStatusOpporTask,
    canDeleteOpporTask,
    canExportOpporTask,
  };
}
