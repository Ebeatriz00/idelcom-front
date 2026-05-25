
import { statusToBool } from "@/sharedKernel/utils/status";
import type { ModulesResponseDto } from "@/application/dtos/configurations/Modules/ModulesResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";

export const moduleGuards = createRowGuards<ModulesResponseDto>({
  getInUse: (row) => (row.modulesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});