import type { StateOpportunityResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const stateOpportunityGuards =
  createRowGuards<StateOpportunityResponseDto>({
    getActive: (row) => statusToBool(row.status),
    canToggleWhenInUse: false,
    canDeleteWhenInUse: false,
  });
