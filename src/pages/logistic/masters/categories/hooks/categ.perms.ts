import { useAuthPerms } from "@/sharedKernel";

export function useMassCategoriesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewCategories =
    !isLoading && has("masters_categories", "view_module");
  const canViewAllCategories =
    !isLoading && has("masters_categories", "all_list");

  /*ACCIONES*/
  const canCreateCategories = !isLoading && has("masters_categories", "create");
  const canEditCategories = !isLoading && has("masters_categories", "edit");
  const canEditStatusCategories =
    !isLoading && has("masters_categories", "edit_status");
  const canDeleteCategories =
    !isLoading && has("masters_categories", "eliminate");
  const canExportCategories = !isLoading && has("masters_categories", "export");

  return {
    isLoadingPerms: isLoading,
    canViewCategories,
    canViewAllCategories,
    canCreateCategories,
    canEditCategories,
    canEditStatusCategories,
    canDeleteCategories,
    canExportCategories,
  };
}
