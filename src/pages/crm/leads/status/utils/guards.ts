import type { LeadsStatusResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const leadsStatusGuards = createRowGuards<LeadsStatusResponseDto>({
  getInUse: (row) => (row.leadsStatusCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
