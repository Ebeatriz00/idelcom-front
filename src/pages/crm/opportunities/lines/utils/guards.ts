import type { BusinessLineResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const businessLineGuards = createRowGuards<BusinessLineResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
