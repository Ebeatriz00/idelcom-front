import { UseDashCommercial } from "@/pages/Dashboard/hooks/commercial.perms";
import { CommercialDashboard } from "./components/Commercial/DashboardCommercial";
import { PreSalesDashboard } from "./components/PreSales/DashboardPreSales";

export const DashboardPage = () => {
  const { canViewDashboard, canViewDashboardPreSale } = UseDashCommercial();

  return (
    <div className="p-6 min-h-screen bg-slate-50/80">
      
      {canViewDashboard && (
         <CommercialDashboard />
      )}

      {!canViewDashboard && canViewDashboardPreSale && (
         <PreSalesDashboard />
      )}

      {!canViewDashboard && !canViewDashboardPreSale && (
        <div className="flex h-[50vh] items-center justify-center text-slate-400">
          No tienes permisos para ver ningún panel.
        </div>
      )}

    </div>
  );
};