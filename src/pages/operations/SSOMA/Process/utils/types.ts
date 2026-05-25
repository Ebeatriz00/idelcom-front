import type { SsomaProcessResponseDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: SsomaProcessResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;

  search: string;
  onSearchChange: (q: string) => void;
  canEdit?: boolean;
  canExport?: boolean;
  canEditStatus?: boolean;
};
