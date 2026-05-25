
import type { TasksProjectResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const tasksProjectGuards = createRowGuards<TasksProjectResponseDto>({
  getInUse: (row) => (row.tasksProjectCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});