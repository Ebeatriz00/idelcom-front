import type { ProcessTypeResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const processTypeGuards = createRowGuards<ProcessTypeResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
