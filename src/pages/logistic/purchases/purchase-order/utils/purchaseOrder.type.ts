import type { PurchaseOrderResponseDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: PurchaseOrderResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onView: (row: PurchaseOrderResponseDto) => void;
  onEdit: (row: PurchaseOrderResponseDto) => void;
  onSendForApproval: (row: PurchaseOrderResponseDto) => void;
  onApprove: (row: PurchaseOrderResponseDto) => void;
  onPrint: (row: PurchaseOrderResponseDto) => void;
  onCancel: (row: PurchaseOrderResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  canExport?: boolean;
  loading?: boolean;
};
