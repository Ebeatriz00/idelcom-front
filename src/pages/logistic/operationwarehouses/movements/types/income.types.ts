import type {
  MovementTypesResponseDto,
  OptionItem,
  WarehousesMovementByIdDto,
  WarehousesMovementResponseDto,
} from "@/application";
import type { PaginationState } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { mapIncomeFormToDto } from "../utils/incomes.mappers";

export type IncomeFilterState = {
  search: string;
  movementTypeId?: number;
  warehouseId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type ActiveIncomeFilter = {
  key: string;
  label: string;
};

export type IncomeFiltersBarProps = {
  filters: IncomeFilterState;
  incomeTypes: MovementTypesResponseDto[];
  warehouses: OptionItem[];
  onChange: (next: IncomeFilterState) => void;
  onReset: () => void;
};

export type IncomeMetricTone = "primary" | "accent" | "muted" | "secondary";

export type IncomeMetricCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: IncomeMetricTone;
};

export type IncomeHeaderProps = {
  onCreate: () => void;
};

export type EmptyIncomesStateProps = {
  hasRows: boolean;
  loading: boolean;
};

export type IncomesTableProps = {
  data: WarehousesMovementResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater:
      | PaginationState
      | ((p: PaginationState) => PaginationState),
  ) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  filtersSlot: ReactNode;
  onView: (row: WarehousesMovementResponseDto) => void;
};

export type IncomeFormModalProps = {
  open: boolean;
  movementTypes: MovementTypesResponseDto[];
  warehouses: OptionItem[];
  onClose: () => void;
  onSubmit: (dto: ReturnType<typeof mapIncomeFormToDto>) => Promise<void> | void;
  saving?: boolean;
};

export type IncomeDetailModalProps = {
  open: boolean;
  data?: WarehousesMovementByIdDto;
  loading?: boolean;
  onClose: () => void;
};

export type ProductPickerValue = {
  productsId: number;
  productLabel: string;
  sku?: string;
  barcode?: string;
  partNum?: string;
  brand?: string;
  productType?: string;
  currentStock?: number;
  averageCost?: number;
  lastCost?: number;
  manageLots?: boolean;
  manageSerials?: boolean;
  expirationControl?: boolean;
};

export type ProductSearchPickerProps = {
  value?: ProductPickerValue | null;
  warehouseId?: number;
  error?: string;
  onChange: (value: ProductPickerValue) => void;
};
