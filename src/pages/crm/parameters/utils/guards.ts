import type { CommercialParametersResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const CommercialParametersGuards = createRowGuards<CommercialParametersResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
