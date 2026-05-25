
import type { AccountResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const accountGuards = createRowGuards<AccountResponseDto>({
  getInUse: (row) => (row.accountCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});