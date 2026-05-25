import type { QualificationsResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const qualificationsGuards = createRowGuards<QualificationsResponseDto>({
  getInUse: (row) => (row.leadsQualificationsCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
