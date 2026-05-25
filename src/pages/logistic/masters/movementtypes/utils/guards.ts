
import type { MovementTypesResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const movementTypesGuards = createRowGuards<MovementTypesResponseDto>({

  getInUse: (row) => (row.movementTypesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});