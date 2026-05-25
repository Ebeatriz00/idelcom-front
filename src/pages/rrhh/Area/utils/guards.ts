import type { AreaResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const areaGuards = createRowGuards<AreaResponseDto>({
  getInUse: (row) => (row.areaCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
