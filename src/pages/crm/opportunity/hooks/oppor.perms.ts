import { useAuthPerms } from "@/sharedKernel";

export function useCrmOpporPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/

  const canViewAllOppor =
    !isLoading && has("crm_opportunities_crm", "all_list");
  const canUseSellerOption =
    !isLoading && has("crm_opportunities_crm", "seller_option");
  const canUseViewComment =
    !isLoading && has("crm_opportunities_crm", "view_comment");

  /*ACCIONES*/
  const canCreateOppor = !isLoading && has("crm_opportunities_crm", "create");

  const canEditOppor = !isLoading && has("crm_opportunities_crm", "edit");

  const canEditStatusOppor =
    !isLoading && has("crm_opportunities_crm", "edit_status");

  const canDeleteOppor =
    !isLoading && has("crm_opportunities_crm", "eliminate");

  const canExportOppor = !isLoading && has("crm_opportunities_crm", "export");

  const canAddCommentOppor =
    !isLoading && has("crm_opportunities_crm", "add_comment");

  const canApproveViability =
    !isLoading && has("crm_opportunities_crm", "approve_viability");

  const canUseFileOption =
    !isLoading && has("crm_opportunities_crm", "option_files");

  const canCreateOpporManager =
    !isLoading && has("crm_opportunities_crm", "add_manager_opport");
  /*ACCIONES DETALLE COMERCIAL*/

  const canAddActivityComm =
    !isLoading && has("crm_opportunities_crm", "add_activity");
  const canEditStateActivityComm =
    !isLoading && has("crm_opportunities_crm", "edit_state_activity");
  const canEditPriorityActivityComm =
    !isLoading && has("crm_opportunities_crm", "edit_priority_activity");
  const canDeleteActivityComm =
    !isLoading && has("crm_opportunities_crm", "delete_activity");

  const canAddTasksComm =
    !isLoading && has("crm_opportunities_crm", "add_tasks");
  const canEditStateTasksComm =
    !isLoading && has("crm_opportunities_crm", "edit_state_tasks");
  const canEditPriorityTasksComm =
    !isLoading && has("crm_opportunities_crm", "edit_priority_tasks");
  const canDeleteTasksComm =
    !isLoading && has("crm_opportunities_crm", "delete_tasks");

  /*ACCIONES ARCHIVOS COMERCIAL*/

  /* COMERCIAL */
  const canViewBudget =
    !isLoading && has("crm_opportunities_crm", "view_budget_folder");
  const canAddBudget =
    !isLoading && has("crm_opportunities_crm", "add_budget_file");
  const canDownaldBudget =
    !isLoading && has("crm_opportunities_crm", "download_budget_file");

  const canDeleteBudget =
    !isLoading && has("crm_opportunities_crm", "delete_budget_file");

  /* COMERCIAL -  CLIENTES */
  const canViewClientComm =
    !isLoading && has("crm_opportunities_crm", "view_commercial_client_folder");
  const canAddClientComm =
    !isLoading && has("crm_opportunities_crm", "add_commercial_client_file");
  const canDownaldClientComm =
    !isLoading &&
    has("crm_opportunities_crm", "download_commercial_client_file");

  const canDeleteClientComm =
    !isLoading && has("crm_opportunities_crm", "delete_commercial_client_file");

  /* LOGISTICA */
  const canViewLogistic =
    !isLoading && has("crm_opportunities_crm", "view_logistics_folder");
  const canAddLogistic =
    !isLoading && has("crm_opportunities_crm", "add_logistics_file");
  const canDownaldLogistic =
    !isLoading && has("crm_opportunities_crm", "download_logistics_file");
  const canDeleteLogistic =
    !isLoading && has("crm_opportunities_crm", "delete_logistics_file");

  /* PREVENTA */
  const canViewPreSales =
    !isLoading && has("crm_opportunities_crm", "view_presales_folder");

  /* PREVENTA - CLIENTES */
  const canViewClientPreSales =
    !isLoading && has("crm_opportunities_crm", "view_presales_client_folder");
  const canAddClientPreSales =
    !isLoading && has("crm_opportunities_crm", "add_presales_client_file");
  const canDownaldClientPreSales =
    !isLoading && has("crm_opportunities_crm", "download_presales_client_file");

  const canDeleteClientPreSales =
    !isLoading && has("crm_opportunities_crm", "delete_presales_client_file");

  /* PREVENTA - COTIZACIONES */
  const canViewQuotPreSales =
    !isLoading && has("crm_opportunities_crm", "view_presales_quot_folder");
  const canAddQuotPreSales =
    !isLoading && has("crm_opportunities_crm", "add_presales_quot_file");
  const canDownaldQuotPreSales =
    !isLoading && has("crm_opportunities_crm", "download_presales_quot_file");

  const canDeleteQuotPreSales =
    !isLoading && has("crm_opportunities_crm", "delete_presales_quot_file");

  /* PREVENTA - TECNICA */
  const canViewTechnical =
    !isLoading && has("crm_opportunities_crm", "view_technical_folder");
  const canAddTechnical =
    !isLoading && has("crm_opportunities_crm", "add_technical_file");
  const canDownaldTechnical =
    !isLoading && has("crm_opportunities_crm", "download_technical_file");
  const canDeleteTechnical =
    !isLoading && has("crm_opportunities_crm", "delete_technical_file");

  /* ECONOMICA */
  const canViewEconomy =
    !isLoading && has("crm_opportunities_crm", "view_economic_folder");

  const canViewBilling =
    !isLoading && has("crm_opportunities_crm", "view_billing_folder");
  const canAddBilling =
    !isLoading && has("crm_opportunities_crm", "add_billing_file");
  const canDownaldBilling =
    !isLoading && has("crm_opportunities_crm", "download_billing_file");
  const canDeleteBilling =
    !isLoading && has("crm_opportunities_crm", "delete_billing_file");

  const canViewSignedGuides =
    !isLoading && has("crm_opportunities_crm", "view_signed_guides_folder");
  const canAddSignedGuides =
    !isLoading && has("crm_opportunities_crm", "add_signed_guides_file");
  const canDownaldSignedGuides =
    !isLoading && has("crm_opportunities_crm", "download_signed_guides_file");
  const canDeleteSignedGuides =
    !isLoading && has("crm_opportunities_crm", "delete_signed_guides_file");

  const canViewPaymentVoucher =
    !isLoading && has("crm_opportunities_crm", "view_payment_voucher_folder");
  const canAddPaymentVoucher =
    !isLoading && has("crm_opportunities_crm", "add_payment_voucher_file");
  const canDownaldPaymentVoucher =
    !isLoading && has("crm_opportunities_crm", "download_payment_voucher_file");
  const canDeletePaymentVoucher =
    !isLoading && has("crm_opportunities_crm", "delete_payment_voucher_file");

  const canViewConformityCertificate =
    !isLoading &&
    has("crm_opportunities_crm", "view_conformity_certificate_folder");
  const canAddConformityCertificate =
    !isLoading &&
    has("crm_opportunities_crm", "add_conformity_certificate_file");
  const canDownaldConformityCertificate =
    !isLoading &&
    has("crm_opportunities_crm", "download_conformity_certificate_file");
  const canDeleteConformityCertificate =
    !isLoading &&
    has("crm_opportunities_crm", "delete_conformity_certificate_file");

  /* CONTRATACIONES */
  const canViewContracts =
    !isLoading && has("crm_opportunities_crm", "view_contracts_folder");

  const canViewConsulting =
    !isLoading && has("crm_opportunities_crm", "view_consulting_folder");
  const canAddConsulting =
    !isLoading && has("crm_opportunities_crm", "add_consulting_file");
  const canDownaldConsulting =
    !isLoading && has("crm_opportunities_crm", "download_consulting_file");
  const canDeleteConsulting =
    !isLoading && has("crm_opportunities_crm", "delete_consulting_file");

  const canViewDocumentation =
    !isLoading && has("crm_opportunities_crm", "view_documentation_folder");
  const canAddDocumentation =
    !isLoading && has("crm_opportunities_crm", "add_documentation_file");
  const canDownaldDocumentation =
    !isLoading && has("crm_opportunities_crm", "download_documentation_file");
  const canDeleteDocumentation =
    !isLoading && has("crm_opportunities_crm", "delete_documentation_file");

  /* REPORTES */
  const canViewReports =
    !isLoading && has("crm_opportunities_crm", "view_reports_folder");
  const canAddReports =
    !isLoading && has("crm_opportunities_crm", "add_reports_file");
  const canDownaldReports =
    !isLoading && has("crm_opportunities_crm", "download_reports_file");
  const canDeleteReports =
    !isLoading && has("crm_opportunities_crm", "delete_reports_file");

  const canViewInfoClient = 
    !isLoading && has("crm_opportunities_crm", "view_logistic_client_info_folder");
  const canAddInfoClient  = 
    !isLoading && has("crm_opportunities_crm", "add_logistic_client_info_file");  
  const canDownloadInfoClient  = 
    !isLoading && has("crm_opportunities_crm", "download_logistic_client_info_file");
  const canDeleteInfoClient  = 
    !isLoading && has("crm_opportunities_crm", "delete_logistic_client_info_file");

  const canViewDeliveryGuidesFolder =
    !isLoading && has("crm_opportunities_crm", "view_logistic_delivery_guides_folder");
    
  const canViewDispatchGuidesFolder =
    !isLoading && has("crm_opportunities_crm", "view_logistic_dispatch_guides_folder");
  const canAddDispatchGuidesFolder =
    !isLoading && has("crm_opportunities_crm", "add_logistic_dispatch_guides_file");
  const canDownloadDispatchGuidesFolder =
    !isLoading && has("crm_opportunities_crm", "download_logistic_dispatch_guides_file");
  const canDeleteDispatchGuidesFolder =
    !isLoading && has("crm_opportunities_crm", "delete_logistic_dispatch_guides_file");    

  const canViewLogisticGuidesTools = 
    !isLoading && has("crm_opportunities_crm", "view_logistic_guides_tools_folder");
  const canAddLogisticGuidesTools = 
    !isLoading && has("crm_opportunities_crm", "add_logistic_guides_tools_file");
  const canDownloadLogisticGuidesTools = 
    !isLoading && has("crm_opportunities_crm", "download_logistic_guides_tools_file");
  const canDeleteLogisticGuidesTools = 
    !isLoading && has("crm_opportunities_crm", "delete_logistic_guides_tools_file");    

  const canViewLogisticEvidenceDeliveries = 
    !isLoading && has("crm_opportunities_crm", "view_logistic_evidence_deliveries_folder");
  const canAddLogisticEvidenceDeliveries = 
    !isLoading && has("crm_opportunities_crm", "add_logistic_evidence_deliveries_file");
  const canDownloadLogisticEvidenceDeliveries = 
    !isLoading && has("crm_opportunities_crm", "download_logistic_evidence_deliveries_file");
  const canDeleteLogisticEvidenceDeliveries = 
    !isLoading && has("crm_opportunities_crm", "delete_logistic_evidence_deliveries_file");  

  const canViewTechSpecFolder =
    !isLoading && has("crm_opportunities_crm", "view_logistic_tech_spec_folder");
  const canAddTechSpecFolder =
    !isLoading && has("crm_opportunities_crm", "add_logistic_tech_spec_file");
  const canDownloadTechSpecFolder =
    !isLoading && has("crm_opportunities_crm", "download_logistic_tech_spec_file");
  const canDeleteTechSpecFolder =
    !isLoading && has("crm_opportunities_crm", "delete_logistic_tech_spec_file");

  return {
    isLoadingPerms: isLoading,
    canUseSellerOption,
    canUseViewComment,
    canViewAllOppor,
    canCreateOppor,
    canEditOppor,
    canApproveViability,
    canAddCommentOppor,
    canEditStatusOppor,
    canDeleteOppor,
    canExportOppor,
    canUseFileOption,
    canCreateOpporManager,

    canAddActivityComm,
    canEditStateActivityComm,
    canEditPriorityActivityComm,
    canDeleteActivityComm,

    canAddTasksComm,
    canEditStateTasksComm,
    canEditPriorityTasksComm,
    canDeleteTasksComm,

    /* COMERCIAL */
    canViewBudget,
    canAddBudget,
    canDownaldBudget,
    canDeleteBudget,

    canViewClientComm,
    canAddClientComm,
    canDownaldClientComm,
    canDeleteClientComm,

    /* LOGISTICA */
    canViewLogistic,
    canAddLogistic,
    canDownaldLogistic,
    canDeleteLogistic,

    /* PREVENTA */
    canViewPreSales,

    canViewTechnical,
    canAddTechnical,
    canDownaldTechnical,
    canDeleteTechnical,

    canViewClientPreSales,
    canAddClientPreSales,
    canDownaldClientPreSales,
    canDeleteClientPreSales,

    canViewQuotPreSales,
    canAddQuotPreSales,
    canDownaldQuotPreSales,
    canDeleteQuotPreSales,

    /* FINANZAS */
    canViewEconomy,

    canViewBilling,
    canAddBilling,
    canDownaldBilling,
    canDeleteBilling,

    canViewSignedGuides,
    canAddSignedGuides,
    canDownaldSignedGuides,
    canDeleteSignedGuides,

    canViewPaymentVoucher,
    canAddPaymentVoucher,
    canDownaldPaymentVoucher,
    canDeletePaymentVoucher,

    canViewConformityCertificate,
    canAddConformityCertificate,
    canDownaldConformityCertificate,
    canDeleteConformityCertificate,

    /* CONTRATACIONES */
    canViewContracts,

    canViewConsulting,
    canAddConsulting,
    canDownaldConsulting,
    canDeleteConsulting,
    canViewDocumentation,
    canAddDocumentation,
    canDownaldDocumentation,
    canDeleteDocumentation,

    /* REPORTES */
    canViewReports,
    canAddReports,
    canDownaldReports,
    canDeleteReports,

    canViewInfoClient,
    canAddInfoClient,
    canDownloadInfoClient,
    canDeleteInfoClient,

    canViewDeliveryGuidesFolder,

    canViewDispatchGuidesFolder,
    canAddDispatchGuidesFolder,
    canDownloadDispatchGuidesFolder,
    canDeleteDispatchGuidesFolder,

    canViewLogisticGuidesTools,
    canAddLogisticGuidesTools,
    canDownloadLogisticGuidesTools,
    canDeleteLogisticGuidesTools,

    canViewLogisticEvidenceDeliveries,
    canAddLogisticEvidenceDeliveries,
    canDownloadLogisticEvidenceDeliveries,
    canDeleteLogisticEvidenceDeliveries,

    canViewTechSpecFolder,
    canAddTechSpecFolder,
    canDownloadTechSpecFolder,
    canDeleteTechSpecFolder,

  };
}
