import type { ConceptsResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const conceptsGuards = createRowGuards<ConceptsResponseDto>({
  getInUse: (row) => (row.conceptsCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});