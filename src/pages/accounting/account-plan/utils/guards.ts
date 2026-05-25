import type { AccountPlanResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const accountPlanGuards = createRowGuards<AccountPlanResponseDto>({
  getInUse: (row) => (row.accountPlanCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
