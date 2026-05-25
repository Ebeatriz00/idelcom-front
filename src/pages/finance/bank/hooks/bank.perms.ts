import { useAuthPerms } from "@/sharedKernel";

export function useFinBankPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewBank = !isLoading && has("treasury_banks", "view_module");
  const canViewAllBank = !isLoading && has("treasury_banks", "all_list");

  /*ACCIONES*/
  const canCreateBank = !isLoading && has("treasury_banks", "create");
  const canEditBank = !isLoading && has("treasury_banks", "edit");
  const canEditStatusBank = !isLoading && has("treasury_banks", "edit_status");
  const canDeleteBank = !isLoading && has("treasury_banks", "eliminate");
  const canExportBank = !isLoading && has("treasury_banks", "export");

  return {
    isLoadingPerms: isLoading,
    canViewBank,
    canViewAllBank,
    canCreateBank,
    canEditBank,
    canEditStatusBank,
    canDeleteBank,
    canExportBank,
  };
}
