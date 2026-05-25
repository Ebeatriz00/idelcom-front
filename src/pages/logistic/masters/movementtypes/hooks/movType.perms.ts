import { useAuthPerms } from "@/sharedKernel";

export function useMassMovTypePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewMovType =
    !isLoading && has("masters_movement_types", "view_module");
  const canViewAllMovType =
    !isLoading && has("masters_movement_types", "all_list");

  /*ACCIONES*/
  const canCreateMovType =
    !isLoading && has("masters_movement_types", "create");
  const canEditMovType = !isLoading && has("masters_movement_types", "edit");
  const canEditStatusMovType =
    !isLoading && has("masters_movement_types", "edit_status");
  const canDeleteMovType =
    !isLoading && has("masters_movement_types", "eliminate");
  const canExportMovType =
    !isLoading && has("masters_movement_types", "export");

  return {
    isLoadingPerms: isLoading,
    canViewMovType,
    canViewAllMovType,
    canCreateMovType,
    canEditMovType,
    canEditStatusMovType,
    canDeleteMovType,
    canExportMovType,
  };
}
