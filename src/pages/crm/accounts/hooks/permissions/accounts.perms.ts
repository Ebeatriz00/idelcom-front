import { useAuthPerms } from "@/sharedKernel";

export function useCrmAccountsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewAccount = !isLoading && has("crm_accounts", "view_module");
  const canViewAllAccount = !isLoading && has("crm_accounts", "all_list");
  const canUseSellerOption = !isLoading && has("crm_accounts", "seller_option");

  const canViewHistoryAccount =
    !isLoading && has("crm_accounts", "view_history");

  /*ACCIONES*/
  const canAddContact = !isLoading && has("crm_accounts", "add_contact");
  const canChangeSellerOption = !isLoading && has("crm_accounts", "change_salesperson");
  const canCreateAccount = !isLoading && has("crm_accounts", "create");
  const canEditAccount = !isLoading && has("crm_accounts", "edit");
  const canEditStatusAccount = !isLoading && has("crm_accounts", "edit_status");
  const canDeleteAccount = !isLoading && has("crm_accounts", "eliminate");
  const canExportAccount = !isLoading && has("crm_accounts", "export");

  return {
    isLoadingPerms: isLoading,
    canViewAccount,
    canViewAllAccount,
    canAddContact,
    canChangeSellerOption,
    canViewHistoryAccount,
    canUseSellerOption,
    canCreateAccount,
    canEditAccount,
    canEditStatusAccount,
    canDeleteAccount,
    canExportAccount,
  };
}
