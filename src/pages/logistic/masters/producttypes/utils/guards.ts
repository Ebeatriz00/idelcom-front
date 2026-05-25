import type { ProductTypesResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const productTypesGuards = createRowGuards<ProductTypesResponseDto>({
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
