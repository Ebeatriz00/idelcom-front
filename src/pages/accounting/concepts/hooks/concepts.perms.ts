import { useAuthPerms } from "@/sharedKernel";

export function useAccConceptPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewConcept = !isLoading && has("catalogs_concepts", "view_module");
  const canViewAllConcept = !isLoading && has("catalogs_concepts", "all_list");

  /*ACCIONES*/
  const canCreateConcept = !isLoading && has("catalogs_concepts", "create");
  const canEditConcept = !isLoading && has("catalogs_concepts", "edit");
  const canEditStatusConcept =
    !isLoading && has("catalogs_concepts", "edit_status");
  const canDeleteConcept = !isLoading && has("catalogs_concepts", "eliminate");
  const canExportConcept = !isLoading && has("catalogs_concepts", "export");

  return {
    isLoadingPerms: isLoading,
    canViewConcept,
    canViewAllConcept,
    canCreateConcept,
    canEditConcept,
    canEditStatusConcept,
    canDeleteConcept,
    canExportConcept,
  };
}
