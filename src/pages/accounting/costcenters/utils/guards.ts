import type { CostCentersResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const costCentersGuards = createRowGuards<CostCentersResponseDto>({
  getInUse: (row) => (row.costCentersCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});