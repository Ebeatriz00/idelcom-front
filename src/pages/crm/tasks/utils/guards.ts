
import type { TasksResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const tasksGuards = createRowGuards<TasksResponseDto>({
  getInUse: (row) => (row.tasksCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});