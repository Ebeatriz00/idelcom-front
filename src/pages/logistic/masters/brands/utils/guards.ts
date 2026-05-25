import type { BrandsResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const brandsGuards = createRowGuards<BrandsResponseDto>({
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
