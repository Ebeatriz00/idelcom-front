import { useAuthPerms } from "@/sharedKernel";

export function useAccPayTypePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewPayType = !isLoading && has("catalogs_document_types", "view_module");
  const canViewAllPayType = !isLoading && has("catalogs_document_types", "all_list");

  /*ACCIONES*/
  const canCreatePayType = !isLoading && has("catalogs_document_types", "create");
  const canEditPayType = !isLoading && has("catalogs_document_types", "edit");
  const canEditStatusPayType =
    !isLoading && has("catalogs_document_types", "edit_status");
  const canDeletePayType = !isLoading && has("catalogs_document_types", "eliminate");
  const canExportPayType = !isLoading && has("catalogs_document_types", "export");

  return {
    isLoadingPerms: isLoading,
    canViewPayType,
    canViewAllPayType,
    canCreatePayType,
    canEditPayType,
    canEditStatusPayType,
    canDeletePayType,
    canExportPayType,
  };
}
