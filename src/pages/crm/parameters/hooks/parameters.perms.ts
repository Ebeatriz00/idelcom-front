import { useAuthPerms } from "@/sharedKernel";

export function useCrmParametersPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewCommParameters =
    !isLoading && has("crm_parameters", "view_module");
  const canViewAllCommParameters =
    !isLoading && has("crm_parameters", "all_list");

  /*ACCIONES*/
  const canCreateCommParameters = !isLoading && has("crm_parameters", "create");
  const canEditCommParameters = !isLoading && has("crm_parameters", "edit");
  const canEditStatusCommParameters =
    !isLoading && has("crm_parameters", "edit_status");
  const canDeleteCommParameters =
    !isLoading && has("crm_parameters", "eliminate");
  const canExportCommParameters = !isLoading && has("crm_parameters", "export");

  return {
    isLoadingPerms: isLoading,
    canViewCommParameters,
    canViewAllCommParameters,
    canCreateCommParameters,
    canEditCommParameters,
    canEditStatusCommParameters,
    canDeleteCommParameters,
    canExportCommParameters,
  };
}
