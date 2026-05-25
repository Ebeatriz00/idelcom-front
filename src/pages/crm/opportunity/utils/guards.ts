import type { OpportunitiesResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const opportunitiesGuards = createRowGuards<OpportunitiesResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
