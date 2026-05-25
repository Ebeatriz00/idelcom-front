import { fetchOperationsStatusSelect } from "@/infrastructure/api-clients/operations/operationsStatus/operationsStatus.client";
import { useQuery } from "@tanstack/react-query";
import { qkOperationsStatus } from "./operationsStatus.qk";

export function useOperationsStatusSelect(
  page: number,
  search: string = "",
  pageSize: number = 10,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: qkOperationsStatus.select(page, pageSize, search),
    queryFn: () => fetchOperationsStatusSelect(page, pageSize, search),
    staleTime: 5 * 60_000,
    ...options,
  });
}
