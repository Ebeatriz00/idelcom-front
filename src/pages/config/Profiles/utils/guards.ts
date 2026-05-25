// profiles/guards.ts

import { statusToBool } from "@/sharedKernel/utils/status";
import type { ProfilesResposeDto } from "@/application/dtos/configurations/Profiles/PorfilesResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";

export const profileGuards = createRowGuards<ProfilesResposeDto>({
  getInUse: (row) => (row.usersCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
