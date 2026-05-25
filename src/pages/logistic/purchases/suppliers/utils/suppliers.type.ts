import type { SuppliersResponseDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: SuppliersResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: SuppliersResponseDto) => void;
  onToggleStatus: (row: SuppliersResponseDto) => void;
  onDelete: (row: SuppliersResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  canExportSuppliers?: boolean;
  canEditSuppliers?: boolean;
  canEditStatusSuppliers?: boolean;
  canDeleteSuppliers?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
};
