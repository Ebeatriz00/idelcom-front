
import type { BoxesResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const boxesGuards = createRowGuards<BoxesResponseDto>({
  getInUse: (row) => (row.boxesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});