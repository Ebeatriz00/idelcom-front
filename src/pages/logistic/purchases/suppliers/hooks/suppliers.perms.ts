import { useAuthPerms } from "@/sharedKernel";

export function usePurchasesSuppliersPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewSuppliers = !isLoading && has("supply_suppliers", "view_module");
  const canViewAllSuppliers = !isLoading && has("supply_suppliers", "all_list");

  /*ACCIONES*/
  const canCreateSuppliers = !isLoading && has("supply_suppliers", "create");
  const canEditSuppliers = !isLoading && has("supply_suppliers", "edit");
  const canEditStatusSuppliers =
    !isLoading && has("supply_suppliers", "edit_status");
  const canDeleteSuppliers = !isLoading && has("supply_suppliers", "eliminate");
  const canExportSuppliers = !isLoading && has("supply_suppliers", "export");

  return {
    isLoadingPerms: isLoading,
    canViewSuppliers,
    canViewAllSuppliers,
    canCreateSuppliers,
    canEditSuppliers,
    canEditStatusSuppliers,
    canDeleteSuppliers,
    canExportSuppliers,
  };
}
