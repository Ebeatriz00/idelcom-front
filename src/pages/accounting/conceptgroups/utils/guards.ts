
import type { ConceptGroupsResponseDto } from "@/application/dtos/accounting/conceptgroups/ConceptGroupsResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const conceptGroupsGuards = createRowGuards<ConceptGroupsResponseDto>({

  getInUse: (row) => (row.conceptGroupCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});