import { useAuthPerms } from "@/sharedKernel";

export function useAccGroupsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewAccGroups =
    !isLoading && has("catalogs_concept_groups", "view_module");
  const canViewAllAccGroups =
    !isLoading && has("catalogs_concept_groups", "all_list");

  /*ACCIONES*/
  const canCreateAccGroups =
    !isLoading && has("catalogs_concept_groups", "create");
  const canEditAccGroups = !isLoading && has("catalogs_concept_groups", "edit");
  const canEditStatusAccGroups =
    !isLoading && has("catalogs_concept_groups", "edit_status");
  const canDeleteAccGroups =
    !isLoading && has("catalogs_concept_groups", "eliminate");
  const canExportAccGroups =
    !isLoading && has("catalogs_concept_groups", "export");

  return {
    isLoadingPerms: isLoading,
    canViewAccGroups,
    canViewAllAccGroups,
    canCreateAccGroups,
    canEditAccGroups,
    canEditStatusAccGroups,
    canDeleteAccGroups,
    canExportAccGroups,
  };
}
