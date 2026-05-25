import { useAuthPerms } from "@/sharedKernel";

export function useFinTreaAccountsPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewTreaAccounts =
    !isLoading && has("treasury_accounts", "view_module");
  const canViewAllTreaAccounts =
    !isLoading && has("treasury_accounts", "all_list");

  /*ACCIONES*/
  const canCreateTreaAccounts =
    !isLoading && has("treasury_accounts", "create");
  const canEditTreaAccounts = !isLoading && has("treasury_accounts", "edit");
  const canEditStatusTreaAccounts =
    !isLoading && has("treasury_accounts", "edit_status");
  const canDeleteTreaAccounts =
    !isLoading && has("treasury_accounts", "eliminate");
  const canExportTreaAccounts =
    !isLoading && has("treasury_accounts", "export");

  return {
    isLoadingPerms: isLoading,
    canViewTreaAccounts,
    canViewAllTreaAccounts,
    canCreateTreaAccounts,
    canEditTreaAccounts,
    canEditStatusTreaAccounts,
    canDeleteTreaAccounts,
    canExportTreaAccounts,
  };
}
