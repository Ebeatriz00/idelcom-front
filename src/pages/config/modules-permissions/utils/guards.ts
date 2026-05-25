import type { ModulesPermissionsResponseDto } from "@/application";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const modulePermissionsGuards =
  createRowGuards<ModulesPermissionsResponseDto>({
    getInUse: (row) => (row.UsedInProfiles ?? 0) > 0,
    getActive: (row) => statusToBool(row.status),
    canToggleWhenInUse: false,
    canDeleteWhenInUse: false,
  });
