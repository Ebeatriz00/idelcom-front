
import type { SeriesResponseDto } from "@/application/dtos/accounting/series/SeriesResponse.dto";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import { statusToBool } from "@/sharedKernel/utils/status";

export const seriesGuards = createRowGuards<SeriesResponseDto>({

  getInUse: (row) => (row.seriesCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),

  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});