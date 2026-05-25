import type { WorkerResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const workerGuards = createRowGuards<WorkerResponseDto>({
  getInUse: (row) => (row.workerCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
