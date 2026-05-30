import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkOrders } from "./keys/qkOrders";
import { fetchOrdersList, RegisterOrderProjectManager, RegisterOrderQualitySupervisor, RegisterOrderSsoma } from "@/infrastructure/api-clients/operations/orders/orders.client";
import type { CreateProjectManager, CreateQualitySupervisor, RegisterSsoma } from "@/application/dtos/operations/orders/orders.dto";
import { useOrdersPerms } from "@/pages/operations/orders/utils/order.perm";
import { useAuth } from "@/stores/auth";
import { selectWorkerId } from "@/stores/auth/selectors";

export function useOrdersList(
    pageIndex: number,
    pageSize: number,
    search?: string
){
    const s = (search ?? "").trim();
    const workerId = useAuth(selectWorkerId);
    const { canViewAllOrders, canViewFilteredOrders, isLoadingPerms } = useOrdersPerms();
    const workerIdNumber = workerId != null && workerId !== "" ? Number(workerId) : null;
    const filteredWorkerId =
      workerIdNumber != null && Number.isFinite(workerIdNumber)
        ? workerIdNumber
        : null;
    const responsibleStaffId =
      canViewFilteredOrders && filteredWorkerId != null ? filteredWorkerId : null;
    const canFetchOrders =
      !isLoadingPerms &&
      (canViewAllOrders || (canViewFilteredOrders && responsibleStaffId != null));

    return useQuery({
      queryKey: qkOrders.list(pageIndex, pageSize, s, responsibleStaffId),
      queryFn: () => fetchOrdersList(s, responsibleStaffId, pageIndex + 1, pageSize),
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      placeholderData: undefined,
      enabled: canFetchOrders
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
