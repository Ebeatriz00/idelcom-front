import { statusToBool } from "@/sharedKernel/utils/status";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import type { CurrencyResponseDto } from "@/application/dtos/general/Currency/CurrencyResponse.dto";

export const currencyGuards = createRowGuards<CurrencyResponseDto>({
  getInUse: (row) => (row.currencyCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
