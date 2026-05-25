
import type { ProductLinesResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const productLinesGuards = createRowGuards<ProductLinesResponseDto>({
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});