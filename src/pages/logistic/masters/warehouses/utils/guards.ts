import { statusToBool } from "@/sharedKernel/utils/status";

import type { WarehousesResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";

export const warehousesGuards = createRowGuards<WarehousesResponseDto>({
  getInUse: (row) => (row.warehousesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
