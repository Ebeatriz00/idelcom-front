import type { TaxAffTypeResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const TaxAffTypeGuards = createRowGuards<TaxAffTypeResponseDto>({
  getInUse: (row) => (row.taxAffCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
