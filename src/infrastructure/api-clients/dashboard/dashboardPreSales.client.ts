import type { DashboardPreSalesByCategory, DashboardPreSalesByEngineer, DashboardPreSalesByEngineerDetails, DashboardPreSalesCollaborator, DashboardPreSalesCollaboratorDetails, DashboardPreSalesCombined, DashboardPreSalesIntegrator, DashboardPreSalesIntegratorDetails, DashboardPreSalesMatriz, DashboardPreSalesQuotationSales, DashboardPreSalesStates } from "@/application/dtos/dashboard/dashboardPreSales/dashboardPreSales.dto";
import http from "@/infrastructure";
type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}


export async function fetchDashboardQuotationTotal(
  usersId?: number, 
  quarter?: number,
  usersBy?: number,
  year?: number 
): Promise<DashboardPreSalesQuotationSales[]> {
  const params = { usersId, quarter, usersBy, year };
  
  const { data } = await http.get<
    ApiEnvelope<DashboardPreSalesQuotationSales[]> | DashboardPreSalesQuotationSales[]
  >(
    "/DashboardPreSales/QuotaionTotals",
    { params }               
  );
  return unwrap<DashboardPreSalesQuotationSales[]>(data);
  }



  export async function fetchDashboardPreSalesStates(
    usersId?: number, 
    quarter?: number,
    usersBy?: number,
    year?: number 
  ): Promise<DashboardPreSalesStates[]> {
    const params = { usersId, quarter, usersBy, year };

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesStates[]> | DashboardPreSalesStates[]
    >(
      "/DashboardPreSales/ByStates",
      { params }               
    );
    return unwrap<DashboardPreSalesStates[]>(data);
  }
  

  export async function fetchDashboardPreSalesCombined(
    usersId?: number, 
    quarter?: number,
    usersBy?: number,
    year?: number 
  ): Promise<DashboardPreSalesCombined[]> {
    const params = { usersId, quarter, usersBy, year }; 

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesCombined[]> | DashboardPreSalesCombined[]
    >(  
      "/DashboardPreSales/Combined",
      { params }               
    );
    return unwrap<DashboardPreSalesCombined[]>(data);
  }

  export async function fetchDashboardPreSalesByEngineer(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesByEngineer[]> {
    const params = { usersId, quarter, year, stateId };

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesByEngineer[]> | DashboardPreSalesByEngineer[]
    >(
      "/DashboardPreSales/ByEngineer",
      { params }               
    );
    return unwrap<DashboardPreSalesByEngineer[]>(data);
  }

  export async function fetchDashboardPreSalesMatriz(
    usersId?: number, 
    quarter?: number,
    usersBy?: number,
    year?: number
  ): Promise<DashboardPreSalesMatriz[]> {
    const params = { usersId, quarter, usersBy, year };  

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesMatriz[]> | DashboardPreSalesMatriz[]
    >(
      "/DashboardPreSales/Matriz",
      { params }               
    );
    return unwrap<DashboardPreSalesMatriz[]>(data);
  }


  export async function fetchDashboardPreSalesCollaborator(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesCollaborator[]> {
    const params = { usersId, quarter, year, stateId };  

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesCollaborator[]> | DashboardPreSalesCollaborator[]
    >(
      "/DashboardPreSales/ByCollaborator",
      { params }               
    );
    return unwrap<DashboardPreSalesCollaborator[]>(data);
  }


  export async function fetchDashboardPreSalesIntegrator(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesIntegrator[]> {
    const params = { usersId, quarter, year, stateId };

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesIntegrator[]> | DashboardPreSalesIntegrator[]
    >(
      "/DashboardPreSales/ByIntegrators",
      { params }               
    );
    return unwrap<DashboardPreSalesIntegrator[]>(data);
  }


  export async function fetchDashboardPreSalesByEngineerDetails(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesByEngineerDetails[]> {
    const params = { usersId, quarter, year, stateId };
    
    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesByEngineerDetails[]> | DashboardPreSalesByEngineerDetails[]
    >(
      "/DashboardPreSales/ByEngineerDetails",
      { params }               
    );
    return unwrap<DashboardPreSalesByEngineerDetails[]>(data);
  }

  export async function fetchDashboardPreSalesIntegratorDetails(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesIntegratorDetails[]> {
    const params = { usersId, quarter, year, stateId };

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesIntegratorDetails[]> | DashboardPreSalesIntegratorDetails[]
    >(
      "/DashboardPreSales/ByIntegratorsDetails",
      { params }               
    );
    return unwrap<DashboardPreSalesIntegratorDetails[]>(data);
  }

  export async function fetchDashboardPreSalesCollaboratorDetails(
    usersId?: number, 
    quarter?: number,
    year?: number,
    stateId?: number
  ): Promise<DashboardPreSalesCollaboratorDetails[]> {
    const params = { usersId, quarter, year, stateId };

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesCollaboratorDetails[]> | DashboardPreSalesCollaboratorDetails[]
    >(
      "/DashboardPreSales/ByCollaboratorDetails",
      { params }               
    );
    return unwrap<DashboardPreSalesCollaboratorDetails[]>(data);
  }

  export async function fetchDashboardPreSalesByCategory(
    usersId?: number, 
    quarter?: number,
    year?: number,
  ): Promise<DashboardPreSalesByCategory[]> {
    const params = { usersId, quarter, year };  

    const { data } = await http.get<
      ApiEnvelope<DashboardPreSalesByCategory[]> | DashboardPreSalesByCategory[]
    >(
      "/DashboardPreSales/ByCategory",
      { params }               
    );
    return unwrap<DashboardPreSalesByCategory[]>(data);
  }

    

    