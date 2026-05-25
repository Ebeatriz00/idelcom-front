import { useAuthPerms } from "@/sharedKernel";

export function useCrmSourcesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewSources = !isLoading && has("leads_sources", "view_module");
  const canViewAllSources = !isLoading && has("leads_sources", "all_list");

  /*ACCIONES*/
  const canCreateSources = !isLoading && has("leads_sources", "create");
  const canEditSources = !isLoading && has("leads_sources", "edit");
  const canEditStatusSources =
    !isLoading && has("leads_sources", "edit_status");
  const canDeleteSources = !isLoading && has("leads_sources", "eliminate");
  const canExportSources = !isLoading && has("leads_sources", "export");

  return {
    isLoadingPerms: isLoading,
    canViewSources,
    canViewAllSources,
    canCreateSources,
    canEditSources,
    canEditStatusSources,
    canDeleteSources,
    canExportSources,
  };
}
