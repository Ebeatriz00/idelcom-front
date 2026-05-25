import type { ClientsResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const clientsGuards = createRowGuards<ClientsResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
