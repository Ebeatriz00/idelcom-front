import type { LeadsSourcesResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const leadsSourcesGuards = createRowGuards<LeadsSourcesResponseDto>({
  getInUse: (row) => (row.leadsSourcesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
