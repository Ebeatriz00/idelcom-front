import { useAuthPerms } from "@/sharedKernel";

export function useCrmStatePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewState = !isLoading && has("opportunities_states", "view_module");
  const canViewAllState = !isLoading && has("opportunities_states", "all_list");

  /*ACCIONES*/
  const canCreateState = !isLoading && has("opportunities_states", "create");
  const canEditState = !isLoading && has("opportunities_states", "edit");
  const canEditStatusState =
    !isLoading && has("opportunities_states", "edit_status");
  const canDeleteState = !isLoading && has("opportunities_states", "eliminate");
  const canExportState = !isLoading && has("opportunities_states", "export");

  return {
    isLoadingPerms: isLoading,
    canViewState,
    canViewAllState,
    canCreateState,
    canEditState,
    canEditStatusState,
    canDeleteState,
    canExportState,
  };
}
