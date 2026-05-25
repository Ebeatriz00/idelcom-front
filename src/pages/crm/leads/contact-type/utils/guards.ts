import type { ContactTypeResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const contactTypeGuards = createRowGuards<ContactTypeResponseDto>({
  getInUse: (row) => (row.contactTypeCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});