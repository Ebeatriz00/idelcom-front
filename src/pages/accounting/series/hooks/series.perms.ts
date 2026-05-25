import { useAuthPerms } from "@/sharedKernel";

export function useAccSeriesPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewSeries =
    !isLoading && has("catalogs_accounting_series", "view_module");
  const canViewAllSeries =
    !isLoading && has("catalogs_accounting_series", "all_list");

  /*ACCIONES*/
  const canCreateSeries =
    !isLoading && has("catalogs_accounting_series", "create");
  const canEditSeries = !isLoading && has("catalogs_accounting_series", "edit");
  const canEditStatusSeries =
    !isLoading && has("catalogs_accounting_series", "edit_status");
  const canDeleteSeries =
    !isLoading && has("catalogs_accounting_series", "eliminate");
  const canExportSeries =
    !isLoading && has("catalogs_accounting_series", "export");

  return {
    isLoadingPerms: isLoading,
    canViewSeries,
    canViewAllSeries,
    canCreateSeries,
    canEditSeries,
    canEditStatusSeries,
    canDeleteSeries,
    canExportSeries,
  };
}
