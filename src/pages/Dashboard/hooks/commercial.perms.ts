import { useAuthPerms } from "@/sharedKernel";

export function UseDashCommercial() {
  const { has, isLoading } = useAuthPerms();
  const canViewDashboard =
    !isLoading && has("dashboard_commercial", "seller_option");
  const isManager =
    !isLoading && has("crm_opportunities_crm", "all_list");
  const canViewDashboardPreSale =
    !isLoading && has("dashboard_pre_sale", "seller_option");
  const isPreSalesManager = 
    !isLoading && has("dashboard_pre_sale", "all_list");
    

  return {
    isLoadingPerms: isLoading,
    canViewDashboard,   
    isManager,      
    canViewDashboardPreSale,
    isPreSalesManager
  };
}