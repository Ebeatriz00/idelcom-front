import { useAuthPerms } from "@/sharedKernel";

export function usePreSaleProyectsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewAllPreSaleProyects =
    !isLoading && has("presale_projects", "all_list");

  /*ACCIONES*/
  const canExportPreSaleProyects =
    !isLoading && has("presale_projects", "export");

  /*ACCIONES DETALLE PROYECTO PREVENTA*/
  const canAddActivityProject =
    !isLoading && has("presale_projects", "add_activity");
  const canEditStateActivityProject =
    !isLoading && has("presale_projects", "edit_state_activity");
  const canEditPriorityActivityProject =
    !isLoading && has("presale_projects", "edit_priority_activity");
  const canDeleteActivityProject =
    !isLoading && has("presale_projects", "delete_activity");

  const canViewViability =
    !isLoading && has("presale_projects", "view_commercial_viability");
  const canAddCollaborators =
    !isLoading && has("presale_projects", "add_collaborators");
  const canUpdateProjectStatus =
    !isLoading && has("presale_projects", "update_project_status");
  const canAddPreSalesResponsible =
    !isLoading && has("presale_projects", "add_presales_responsible");

  const canAddTasksProject = !isLoading && has("presale_projects", "add_tasks");
  const canEditStateTasksProject =
    !isLoading && has("presale_projects", "edit_state_tasks");
  const canEditPriorityTasksProject =
    !isLoading && has("presale_projects", "edit_priority_tasks");
  const canDeleteTasksProject =
    !isLoading && has("presale_projects", "delete_tasks");

  /*ACCIONES ARCHIVOS PROYECTO PREVENTA*/
  const canViewBudget =
    !isLoading && has("presale_projects", "view_budget_folder");
  const canAddBuget = !isLoading && has("presale_projects", "add_budget_file");
  const canDownaldBudget =
    !isLoading && has("presale_projects", "download_budget_file");
  const canDeleteBudget =
    !isLoading && has("presale_projects", "delete_budget_file");

  /* COMERCIAL -  CLIENTES */
  const canViewClientComm =
    !isLoading && has("presale_projects", "view_commercial_client_folder");
  const canAddClientComm =
    !isLoading && has("presale_projects", "add_commercial_client_file");
  const canDownaldClientComm =
    !isLoading && has("presale_projects", "download_commercial_client_file");
  const canDeleteClientComm =
    !isLoading && has("presale_projects", "delete_commercial_client_file");

  /* LOGISTICA */
  const canViewLogistic =
    !isLoading && has("presale_projects", "view_logistics_folder");
  const canAddLogistic =
    !isLoading && has("presale_projects", "add_logistics_file");
  const canDownaldLogistic =
    !isLoading && has("presale_projects", "download_logistics_file");
  const canDeleteLogistic =
    !isLoading && has("presale_projects", "delete_logistics_file");

  const canViewTechnical =
    !isLoading && has("presale_projects", "view_technical_folder");
  const canAddTechnical =
    !isLoading && has("presale_projects", "add_technical_file");
  const canDownaldTechnical =
    !isLoading && has("presale_projects", "download_technical_file");

  /* PREVENTA */
  const canViewPreSales =
    !isLoading && has("presale_projects", "view_presales_folder");

  /* PREVENTA - CLIENTES */
  const canViewClientPreSales =
    !isLoading && has("presale_projects", "view_presales_client_folder");
  const canAddClientPreSales =
    !isLoading && has("presale_projects", "add_presales_client_file");
  const canDownaldClientPreSales =
    !isLoading && has("presale_projects", "download_presales_client_file");

  const canDeleteClientPreSales =
    !isLoading && has("presale_projects", "delete_presales_client_file");

  /* PREVENTA - COTIZACIONES */
  const canViewQuotPreSales =
    !isLoading && has("presale_projects", "view_presales_quot_folder");
  const canAddQuotPreSales =
    !isLoading && has("presale_projects", "add_presales_quot_file");
  const canDownaldQuotPreSales =
    !isLoading && has("presale_projects", "download_presales_quot_file");

  const canDeleteQuotPreSales =
    !isLoading && has("presale_projects", "delete_presales_quot_file");

  /* PREVENTA - TECNICA */

  const canDeleteTechnical =
    !isLoading && has("presale_projects", "delete_technical_file");

  const canViewEconomy =
    !isLoading && has("presale_projects", "view_economic_folder");

  const canViewBilling =
    !isLoading && has("presale_projects", "view_billing_folder");
  const canAddBilling =
    !isLoading && has("presale_projects", "add_billing_file");
  const canDownaldBilling =
    !isLoading && has("presale_projects", "download_billing_file");
  const canDeleteBilling =
    !isLoading && has("presale_projects", "delete_billing_file");

  const canViewSignedGuides =
    !isLoading && has("presale_projects", "view_signed_guides_folder");
  const canAddSignedGuides =
    !isLoading && has("presale_projects", "add_signed_guides_file");
  const canDownaldSignedGuides =
    !isLoading && has("presale_projects", "download_signed_guides_file");
  const canDeleteSignedGuides =
    !isLoading && has("presale_projects", "delete_signed_guides_file");

  const canViewPaymentVoucher =
    !isLoading && has("presale_projects", "view_payment_voucher_folder");
  const canAddPaymentVoucher =
    !isLoading && has("presale_projects", "add_payment_voucher_file");
  const canDownaldPaymentVoucher =
    !isLoading && has("presale_projects", "download_payment_voucher_file");
  const canDeletePaymentVoucher =
    !isLoading && has("presale_projects", "delete_payment_voucher_file");

  const canViewConformityCertificate =
    !isLoading && has("presale_projects", "view_conformity_certificate_folder");
  const canAddConformityCertificate =
    !isLoading && has("presale_projects", "add_conformity_certificate_file");
  const canDownaldConformityCertificate =
    !isLoading &&
    has("presale_projects", "download_conformity_certificate_file");
  const canDeleteConformityCertificate =
    !isLoading && has("presale_projects", "delete_conformity_certificate_file");

   const canViewLogisticOcSupliers = 
    !isLoading && has("presale_projects", "view_logistic_oc_suppliers_folder");
  const canAddLogisticOcSupliers = 
    !isLoading && has("presale_projects", "add_logistic_oc_suppliers_file");  
  const canDownaldLogisticOcSupliers = 
    !isLoading && has("presale_projects", "download_logistic_oc_suppliers_file");  
  const canDeleteLogisticOcSupliers = 
    !isLoading && has("presale_projects", "delete_logistic_oc_suppliers_file"); 

  return {
    isLoadingPerms: isLoading,
    /*VISUALIZACIONES*/
    canViewAllPreSaleProyects,
    /*ACCIONES*/
    canExportPreSaleProyects,
    /*ACCIONES DETALLE PROYECTO PREVENTA*/
    canAddActivityProject,
    canEditStateActivityProject,
    canEditPriorityActivityProject,
    canDeleteActivityProject,
    canAddTasksProject,
    canEditStateTasksProject,
    canEditPriorityTasksProject,
    canDeleteTasksProject,
    /*ACCIONES ARCHIVOS PROYECTO PREVENTA*/
    canViewBudget,
    canAddBuget,
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

    canViewViability,
    canAddCollaborators,
    canUpdateProjectStatus,
    canAddPreSalesResponsible,

    canViewLogisticOcSupliers,
    canAddLogisticOcSupliers,
    canDownaldLogisticOcSupliers,
    canDeleteLogisticOcSupliers
  };
}
