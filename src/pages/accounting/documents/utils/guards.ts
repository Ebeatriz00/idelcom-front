import type { PaymentTypeResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const paymentTypeGuards = createRowGuards<PaymentTypeResponseDto>({
  getInUse: (row) => (row.paymentCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
