
import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const contactsGuards = createRowGuards<ContactsResponseDto>({
  getInUse: (row) => (row.contactsCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});