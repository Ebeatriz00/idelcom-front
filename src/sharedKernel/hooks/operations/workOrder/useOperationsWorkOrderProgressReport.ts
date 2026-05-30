import { useQuery } from "@tanstack/react-query";
import { fetchOperationsWorkOrderProgressReport } from "@/infrastructure/api-clients/operations/workOrder/workOrder.client";
import { qkWorkOrder } from "./workOrder.qk";

export function useOperationsWorkOrderProgressReport(
  operationsId: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: qkWorkOrder.progressReport(operationsId),
    queryFn: () => fetchOperationsWorkOrderProgressReport(operationsId),
    enabled: options?.enabled ?? !!operationsId,
  });
}
