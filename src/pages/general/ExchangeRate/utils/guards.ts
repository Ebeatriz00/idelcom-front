import type { ExchangeRateResponseDto } from "@/application/dtos/general/ExchangeRate/ExchangeRateResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const exchangeRateGuards = createRowGuards<ExchangeRateResponseDto>({
  getInUse: (row) => (row.exchangeRateCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});