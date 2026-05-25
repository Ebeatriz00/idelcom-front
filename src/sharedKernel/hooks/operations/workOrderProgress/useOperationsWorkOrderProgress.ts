import { useQuery } from "@tanstack/react-query";
import {
  fetchOperationsWorkOrderProgressList,
  fetchOperationsWorkOrderProgressPhotos,
} from "@/infrastructure/api-clients/operations/workOrderProgress/workOrderProgress.client";
import { qkOperationsWorkOrderProgress } from "./operationsWorkOrderProgress.qk";

export function useOperationsWorkOrderProgressList(
  page: number,
  pageSize: number,
  activityId?: number,
  search?: string,
  date?: string,
  operationsId?: number
) {
  return useQuery({
    queryKey: qkOperationsWorkOrderProgress.list(page, pageSize, activityId, search, date, operationsId),
    queryFn: () => fetchOperationsWorkOrderProgressList(page, pageSize, activityId, search, date, operationsId),
  });
}

export function useOperationsWorkOrderProgressPhotos(progressId: number | null) {
  return useQuery({
    queryKey: qkOperationsWorkOrderProgress.photos(progressId ?? 0),
    queryFn: () => fetchOperationsWorkOrderProgressPhotos(progressId!),
    enabled: progressId != null && progressId > 0,
  });
}
