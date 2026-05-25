import { useAuthPerms } from "@/sharedKernel";

export function useGeneralDocumentTypePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewDocumentType = !isLoading && has("config_documents", "view_module");
  const canViewAllDocumentType = !isLoading && has("config_documents", "all_list");

  /*ACCIONES*/
  const canCreateDocumentType = !isLoading && has("config_documents", "create");
  const canEditDocumentType = !isLoading && has("config_documents", "edit");
  const canEditStatusDocumentType =
    !isLoading && has("config_documents", "edit_status");
  const canDeleteDocumentType = !isLoading && has("config_documents", "eliminate");
  const canExportDocumentType = !isLoading && has("config_documents", "export");

  return {
    isLoadingPerms: isLoading,
    canViewDocumentType,
    canViewAllDocumentType,
    canCreateDocumentType,
    canEditDocumentType,
    canEditStatusDocumentType,
    canDeleteDocumentType,
    canExportDocumentType,
  };
}
