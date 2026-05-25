import type { UomResponseDto } from "@/application/dtos/general/Uom/UomResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const uomGuards = createRowGuards<UomResponseDto>({
  getInUse: (row) => (row.uomCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});