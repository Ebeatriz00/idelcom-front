
import { statusToBool } from "@/sharedKernel/utils/status";
import { createRowGuards } from "@/sharedKernel/utils/rowGuards";
import type { DocumentTypeResponseDto } from "@/application/dtos/general/DocumentType/DocumentTypeResponse.dto";

export const documentTypeGuards = createRowGuards<DocumentTypeResponseDto>({
  getInUse: (row) => (row.documentTypeCount ?? 0) > 0,
  getActive: (row) => statusToBool(row.status),
  canToggleWhenInUse: false,
  canDeleteWhenInUse: false,
});
