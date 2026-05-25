import { useAuthPerms } from "@/sharedKernel";

export function useFinBoxesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewBoxes = !isLoading && has("treasury_boxes", "view_module");
  const canViewAllBoxes = !isLoading && has("treasury_boxes", "all_list");

  /*ACCIONES*/
  const canCreateBoxes = !isLoading && has("treasury_boxes", "create");
  const canEditBoxes = !isLoading && has("treasury_boxes", "edit");
  const canEditStatusBoxes = !isLoading && has("treasury_boxes", "edit_status");
  const canDeleteBoxes = !isLoading && has("treasury_boxes", "eliminate");
  const canExportBoxes = !isLoading && has("treasury_boxes", "export");

  return {
    isLoadingPerms: isLoading,
    canViewBoxes,
    canViewAllBoxes,
    canCreateBoxes,
    canEditBoxes,
    canEditStatusBoxes,
    canDeleteBoxes,
    canExportBoxes,
  };
}
