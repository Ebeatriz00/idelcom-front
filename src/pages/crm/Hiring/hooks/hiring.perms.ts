import { useAuthPerms } from "@/sharedKernel";

export function useHiringPerms() {
  const { has, isLoading } = useAuthPerms();

  const canViewAllOpporHiring =
    !isLoading && has("crm_opportunities_hiring_crm", "all_list");

  // ARCHIVOS
  const canViewContracts =
    !isLoading && has("crm_opportunities_hiring_crm", "view_contracts_folder");

  const canViewConsulting =
    !isLoading && has("crm_opportunities_hiring_crm", "view_consulting_folder");
  const canAddConsulting =
    !isLoading && has("crm_opportunities_hiring_crm", "add_consulting_file");
  const canDownaldConsulting =
    !isLoading &&
    has("crm_opportunities_hiring_crm", "download_consulting_file");
  const canDeleteConsulting =
    !isLoading && has("crm_opportunities_hiring_crm", "delete_consulting_file");

  const canViewReports =
    !isLoading && has("crm_opportunities_hiring_crm", "view_reports_folder");
  const canAddReports =
    !isLoading && has("crm_opportunities_hiring_crm", "add_reports_file");
  const canDownaldReports =
    !isLoading && has("crm_opportunities_hiring_crm", "download_reports_file");
  const canDeleteReports =
    !isLoading && has("crm_opportunities_hiring_crm", "delete_reports_file");

  const canViewDocumentation =
    !isLoading && has("crm_opportunities_hiring_crm", "view_documentation_folder");
  const canAddDocumentation =
    !isLoading && has("crm_opportunities_hiring_crm", "add_documentation_file");
  const canDownaldDocumentation =
    !isLoading && has("crm_opportunities_hiring_crm", "download_documentation_file");
  const canDeleteDocumentation =
    !isLoading && has("crm_opportunities_hiring_crm", "delete_documentation_file");
  


  return {
    isLoadingPerms: isLoading,
    canViewAllOpporHiring,
    canViewContracts,

    canViewConsulting,
    canAddConsulting,
    canDownaldConsulting,
    canDeleteConsulting,

    canViewReports,
    canAddReports,
    canDownaldReports,
    canDeleteReports,


    canViewDocumentation,
    canAddDocumentation,
    canDownaldDocumentation,
    canDeleteDocumentation,
  };
}
