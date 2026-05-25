import { useAuthPerms } from "@/sharedKernel";

export function useQuotesPerms() {
  const { has, isLoading } = useAuthPerms();


  
  const canViewAllQuotes =
  !isLoading &&
  (
    has("crm_opportunities_crm", "all_list") ||
    has("presale_projects", "all_list")
  );

  const canViewAllResponsiblesQuotes =
  !isLoading &&
  (
    has("crm_opportunities_crm", "all_list") ||
    has("presale_projects", "all_list")
  );

  return {
    isLoadingPerms: isLoading,
    canViewAllQuotes,
    canViewAllResponsiblesQuotes,
  };
}
