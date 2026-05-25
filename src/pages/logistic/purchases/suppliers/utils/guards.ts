import { statusToBool } from "@/sharedKernel/utils/status";

import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import type { SuppliersResponseDto } from "@/application";


export const suppliersGuards = createRowGuards<SuppliersResponseDto>({
  getInUse: (row) => (row.suppliersCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});