import type { PermissionsResponseDto } from "@/application/dtos/configurations/Permissions/PermissionsResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";


export const permissionsGuards = createRowGuards<PermissionsResponseDto>({
  getInUse: (row) => (row.permissionsCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});