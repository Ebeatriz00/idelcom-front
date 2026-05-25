import { useAuthPerms } from "@/sharedKernel";

export function useCrmStatusPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewStatus = !isLoading && has("leads_status", "view_module");
  const canViewAllStatus = !isLoading && has("leads_status", "all_list");

  /*ACCIONES*/
  const canCreateStatus = !isLoading && has("leads_status", "create");
  const canEdit = !isLoading && has("leads_status", "edit");
  const canEditStatus = !isLoading && has("leads_status", "edit_status");
  const canDeleteStatus = !isLoading && has("leads_status", "eliminate");
  const canExportStatus = !isLoading && has("leads_status", "export");

  return {
    isLoadingPerms: isLoading,
    canViewStatus,
    canViewAllStatus,
    canCreateStatus,
    canEdit,
    canEditStatus,
    canDeleteStatus,
    canExportStatus,
  };
}
