import { useAuthPerms } from "@/sharedKernel";

export function useHrAreaPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewArea = !isLoading && has("hr_areas", "view_module");
  const canViewAllArea = !isLoading && has("hr_areas", "all_list");

  /*ACCIONES*/
  const canCreateArea = !isLoading && has("hr_areas", "create");
  const canEditArea = !isLoading && has("hr_areas", "edit");
  const canEditStatusArea = !isLoading && has("hr_areas", "edit_status");
  const canDeleteArea = !isLoading && has("hr_areas", "eliminate");
  const canExportArea = !isLoading && has("hr_areas", "export");

  return {
    isLoadingPerms: isLoading,
    canViewArea,
    canViewAllArea,
    canCreateArea,
    canEditArea,
    canEditStatusArea,
    canDeleteArea,
    canExportArea,
  };
}
