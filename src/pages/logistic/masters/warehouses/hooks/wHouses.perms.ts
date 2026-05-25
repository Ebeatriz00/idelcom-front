import { useAuthPerms } from "@/sharedKernel";

export function useMassWHousesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewWHouses = !isLoading && has("masters_warehouses", "view_module");
  const canViewAllWHouses = !isLoading && has("masters_warehouses", "all_list");

  /*ACCIONES*/
  const canCreateWHouses = !isLoading && has("masters_warehouses", "create");
  const canEditWHouses = !isLoading && has("masters_warehouses", "edit");
  const canEditStatusWHouses =
    !isLoading && has("masters_warehouses", "edit_status");
  const canDeleteWHouses = !isLoading && has("masters_warehouses", "eliminate");
  const canExportWHouses = !isLoading && has("masters_warehouses", "export");

  return {
    isLoadingPerms: isLoading,
    canViewWHouses,
    canViewAllWHouses,
    canCreateWHouses,
    canEditWHouses,
    canEditStatusWHouses,
    canDeleteWHouses,
    canExportWHouses,
  };
}
