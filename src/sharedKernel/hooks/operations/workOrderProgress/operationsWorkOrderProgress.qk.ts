export const qkOperationsWorkOrderProgress = {
  all: ["operations-work-order-progress"] as const,
  list: (page: number, pageSize: number, activityId?: number, search?: string, date?: string, operationsId?: number) =>
    [...qkOperationsWorkOrderProgress.all, "list", { page, pageSize, activityId, search, date, operationsId }] as const,
  photos: (progressId: number) => [...qkOperationsWorkOrderProgress.all, "photos", progressId] as const,
};
