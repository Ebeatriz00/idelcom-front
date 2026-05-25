import { useAuthPerms } from "@/sharedKernel";

export function useCrmBLinesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewBLines = !isLoading && has("opportunities_lines", "view_module");
  const canViewAllBLines = !isLoading && has("opportunities_lines", "all_list");

  /*ACCIONES*/
  const canCreateBLines = !isLoading && has("opportunities_lines", "create");
  const canEditBLines = !isLoading && has("opportunities_lines", "edit");
  const canEditStatus = !isLoading && has("opportunities_lines", "edit_status");
  const canDeleteBLines = !isLoading && has("opportunities_lines", "eliminate");
  const canExportBLines = !isLoading && has("opportunities_lines", "export");

  return {
    isLoadingPerms: isLoading,
    canViewBLines,
    canViewAllBLines,
    canCreateBLines,
    canEditBLines,
    canEditStatus,
    canDeleteBLines,
    canExportBLines,
  };
}
