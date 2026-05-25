import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkOrders } from "./keys/qkOrders";
import { fetchOrdersList, RegisterOrderProjectManager, RegisterOrderQualitySupervisor, RegisterOrderSsoma } from "@/infrastructure/api-clients/operations/orders/orders.client";
import type { CreateProjectManager, CreateQualitySupervisor, RegisterSsoma } from "@/application/dtos/operations/orders/orders.dto";

export function useOrdersList(
    pageIndex: number,
    pageSize: number,
    search?: string
){
    return useQuery({
      queryKey: qkOrders.list(pageIndex, pageSize, search ?? ""),
      queryFn: () => fetchOrdersList(search ?? "", pageIndex + 1, pageSize),
      staleTime: 60_000,
      placeholderData: (prev) => prev,
      enabled: true
    });
}

export function useRegisterOrderSsoma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<RegisterSsoma, 'businessId'>) => RegisterOrderSsoma(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkOrders.all }); 
    },
    onError: (error) => {
      console.error("Error en la mutación de SSOMA:", error);
    }
  });
}


export function useRegisterProjectManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateProjectManager, 'businessId'>) => 
      RegisterOrderProjectManager(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkOrders.all }); 
    },
    onError: (error) => {
      console.error("Error en la mutación del Gerente de Proyecto:", error);
    }
  });
}


export function useRegisterQualitySupervisor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateQualitySupervisor, 'businessId'>) => 
      RegisterOrderQualitySupervisor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkOrders.all }); 
    },
    onError: (error) => {
      console.error("Error en la mutación del Supervisor de Calidad:", error);
    }
  });
}
