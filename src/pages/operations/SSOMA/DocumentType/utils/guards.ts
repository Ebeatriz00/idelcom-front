import type { SsomaDocumentTypeResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const ssomaDocumentTypeGuards = createRowGuards<SsomaDocumentTypeResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});