import { useAuthPerms } from "@/sharedKernel";

export function useMassProdTypePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewProdType =
    !isLoading && has("masters_product_types", "view_module");
  const canViewAllProdType =
    !isLoading && has("masters_product_types", "all_list");

  /*ACCIONES*/
  const canCreateProdType =
    !isLoading && has("masters_product_types", "create");
  const canEditProdType = !isLoading && has("masters_product_types", "edit");
  const canEditStatusProdType =
    !isLoading && has("masters_product_types", "edit_status");
  const canDeleteProdType =
    !isLoading && has("masters_product_types", "eliminate");
  const canExportProdType =
    !isLoading && has("masters_product_types", "export");

  return {
    isLoadingPerms: isLoading,
    canViewProdType,
    canViewAllProdType,
    canCreateProdType,
    canEditProdType,
    canEditStatusProdType,
    canDeleteProdType,
    canExportProdType,
  };
}
