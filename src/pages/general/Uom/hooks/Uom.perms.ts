import { useAuthPerms } from "@/sharedKernel";

export function useGeneralUomPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewUom = !isLoading && has("config_uom", "view_module");
  const canViewAllUom = !isLoading && has("config_uom", "all_list");

  /*ACCIONES*/
  const canCreateUom = !isLoading && has("config_uom", "create");
  const canEditUom = !isLoading && has("config_uom", "edit");
  const canEditStatusUom = !isLoading && has("config_uom", "edit_status");
  const canDeleteUom = !isLoading && has("config_uom", "eliminate");
  const canExportUom = !isLoading && has("config_uom", "export");

  return {
    isLoadingPerms: isLoading,
    canViewUom,
    canViewAllUom,
    canCreateUom,
    canEditUom,
    canEditStatusUom,
    canDeleteUom,
    canExportUom,
  };
}
