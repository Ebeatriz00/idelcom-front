import type { UsersResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";


export const usersGuards = createRowGuards<UsersResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
