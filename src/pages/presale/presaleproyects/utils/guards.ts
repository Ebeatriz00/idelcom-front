
import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const preSaleProyectsGuards = createRowGuards<PreSaleProyectsResponseDto>({
  getInUse: (row) => (row.preSaleProyectsCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});