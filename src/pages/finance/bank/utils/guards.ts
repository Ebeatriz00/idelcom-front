import type { BankResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const bankGuards = createRowGuards<BankResponseDto>({

  getInUse: (row) => (row.bankCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});