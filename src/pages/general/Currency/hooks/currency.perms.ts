import { useAuthPerms } from "@/sharedKernel";

export function useGeneralCurrencyPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewCurrency = !isLoading && has("config_currency", "view_module");
  const canViewAllCurrency = !isLoading && has("config_currency", "all_list");

  /*ACCIONES*/
  const canCreateCurrency = !isLoading && has("config_currency", "create");
  const canEditCurrency = !isLoading && has("config_currency", "edit");
  const canEditStatusCurrency =
    !isLoading && has("config_currency", "edit_status");
  const canDeleteCurrency = !isLoading && has("config_currency", "eliminate");
  const canExportCurrency = !isLoading && has("config_currency", "export");

  return {
    isLoadingPerms: isLoading,
    canViewCurrency,
    canViewAllCurrency,
    canCreateCurrency,
    canEditCurrency,
    canEditStatusCurrency,
    canDeleteCurrency,
    canExportCurrency,
  };
}
