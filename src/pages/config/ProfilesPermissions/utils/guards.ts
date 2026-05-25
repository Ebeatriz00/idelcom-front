import type { ProfilesPermissionsResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const profilesPermissionsGuards = createRowGuards<ProfilesPermissionsResponseDto>({
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
  });