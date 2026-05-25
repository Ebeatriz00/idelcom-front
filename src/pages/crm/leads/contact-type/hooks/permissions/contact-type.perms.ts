import { useAuthPerms } from "@/sharedKernel";

export function useCrmContactsTypePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewContactsType = !isLoading && has("leads_types", "view_module");
  const canViewAllContactsType = !isLoading && has("leads_types", "all_list");

  /*ACCIONES*/
  const canCreateContactsType = !isLoading && has("leads_types", "create");
  const canEditContactsType = !isLoading && has("leads_types", "edit");
  const canEditStatusContactsType =
    !isLoading && has("leads_types", "edit_status");
  const canDeleteContactsType = !isLoading && has("leads_types", "eliminate");
  const canExportContactsType = !isLoading && has("leads_types", "export");

  return {
    isLoadingPerms: isLoading,
    canViewContactsType,
    canViewAllContactsType,
    canCreateContactsType,
    canEditContactsType,
    canEditStatusContactsType,
    canDeleteContactsType,
    canExportContactsType,
  };
}
