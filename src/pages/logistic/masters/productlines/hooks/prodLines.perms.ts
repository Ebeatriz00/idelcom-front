import { useAuthPerms } from "@/sharedKernel";

export function useMassProdLinesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewProdLines = !isLoading && has("masters_product_lines", "view_module");
  const canViewAllProdLines = !isLoading && has("masters_product_lines", "all_list");

  /*ACCIONES*/
  const canCreateProdLines = !isLoading && has("masters_product_lines", "create");
  const canEditProdLines = !isLoading && has("masters_product_lines", "edit");
  const canEditStatusProdLines =
    !isLoading && has("masters_product_lines", "edit_status");
  const canDeleteProdLines = !isLoading && has("masters_product_lines", "eliminate");
  const canExportProdLines = !isLoading && has("masters_product_lines", "export");

  return {
    isLoadingPerms: isLoading,
    canViewProdLines,
    canViewAllProdLines,
    canCreateProdLines,
    canEditProdLines,
    canEditStatusProdLines,
    canDeleteProdLines,
    canExportProdLines,
  };
}
