import { useAuthPerms } from "@/sharedKernel";

export function useMassBrandsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewBrands = !isLoading && has("masters_brands", "view_module");
  const canViewAllBrands = !isLoading && has("masters_brands", "all_list");

  /*ACCIONES*/
  const canCreateBrands = !isLoading && has("masters_brands", "create");
  const canEditBrands = !isLoading && has("masters_brands", "edit");
  const canEditStatusBrands =
    !isLoading && has("masters_brands", "edit_status");
  const canDeleteBrands = !isLoading && has("masters_brands", "eliminate");
  const canExportBrands = !isLoading && has("masters_brands", "export");

  return {
    isLoadingPerms: isLoading,
    canViewBrands,
    canViewAllBrands,
    canCreateBrands,
    canEditBrands,
    canEditStatusBrands,
    canDeleteBrands,
    canExportBrands,
  };
}
