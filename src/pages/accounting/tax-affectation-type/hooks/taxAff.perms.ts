import { useAuthPerms } from "@/sharedKernel";

export function useAccTaxAffPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "view_module");
  const canViewAllTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "all_list");

  /*ACCIONES*/
  const canCreateTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "create");
  const canEditTaxAff = !isLoading && has("catalogs_tax_affect_type", "edit");
  const canEditStatusTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "edit_status");
  const canDeleteTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "eliminate");
  const canExportTaxAff =
    !isLoading && has("catalogs_tax_affect_type", "export");

  return {
    isLoadingPerms: isLoading,
    canViewTaxAff,
    canViewAllTaxAff,
    canCreateTaxAff,
    canEditTaxAff,
    canEditStatusTaxAff,
    canDeleteTaxAff,
    canExportTaxAff,
  };
}
