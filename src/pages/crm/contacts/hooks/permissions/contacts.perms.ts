import { useAuthPerms } from "@/sharedKernel";

export function useCrmContactsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewContacts = !isLoading && has("crm_contacts", "view_module");
  const canViewAllContacts = !isLoading && has("crm_contacts", "all_list");
  const canUseSellerOption = !isLoading && has("crm_contacts", "seller_option");

  /*ACCIONES*/
  const canCreateContacts = !isLoading && has("crm_contacts", "create");
  const canEditContacts = !isLoading && has("crm_contacts", "edit");
  const canEditStatusContacts =
    !isLoading && has("crm_contacts", "edit_status");
  const canDeleteContacts = !isLoading && has("crm_contacts", "eliminate");
  const canExportContacts = !isLoading && has("crm_contacts", "export");

  return {
    isLoadingPerms: isLoading,
    canViewContacts,
    canViewAllContacts,
    canUseSellerOption,
    canCreateContacts,
    canEditContacts,
    canEditStatusContacts,
    canDeleteContacts,
    canExportContacts,
  };
}
