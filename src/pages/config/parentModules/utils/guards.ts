import type { ParentModulesResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const parentModulesGuards = createRowGuards<ParentModulesResponseDto>({
  getInUse: (row) => (row.parentCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
