import type { JobTitleResponseDto } from "@/application";
import { createRowGuards, statusToBool } from "@/sharedKernel";

export const jobTitleGuards = createRowGuards<JobTitleResponseDto>({
  getInUse: (row) => (row.jobTitleCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
