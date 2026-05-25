import { useAuthPerms } from "@/sharedKernel";

export function useGeneralExChangeRatePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewExChangeRate =
    !isLoading && has("config_exchange_rate", "view_module");
  const canViewAllExChangeRate =
    !isLoading && has("config_exchange_rate", "all_list");

  /*ACCIONES*/
  const canCreateExChangeRate =
    !isLoading && has("config_exchange_rate", "create");
  const canEditExChangeRate = !isLoading && has("config_exchange_rate", "edit");
  const canEditStatusExChangeRate =
    !isLoading && has("config_exchange_rate", "edit_status");
  const canDeleteExChangeRate =
    !isLoading && has("config_exchange_rate", "eliminate");
  const canExportExChangeRate =
    !isLoading && has("config_exchange_rate", "export");

  return {
    isLoadingPerms: isLoading,
    canViewExChangeRate,
    canViewAllExChangeRate,
    canCreateExChangeRate,
    canEditExChangeRate,
    canEditStatusExChangeRate,
    canDeleteExChangeRate,
    canExportExChangeRate,
  };
}
