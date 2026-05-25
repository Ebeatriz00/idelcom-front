import type { PeriodsResponseDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const periodsGuards = createRowGuards<PeriodsResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
  });