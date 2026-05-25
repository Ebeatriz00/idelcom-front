import type { WarehousesResponseDto, WarehousesUpsertDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";
import type { WarehouseFormValues } from "./warehouse.schema";

export type PropsTable = {
  data: WarehousesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: WarehousesResponseDto) => void;
  onToggleStatus: (row: WarehousesResponseDto) => void;
  onDelete: (row: WarehousesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditWHouses?: boolean;
  canExportWHouses?: boolean;
  canEditStatusWHouses?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<WarehouseFormValues>;
  onSubmit: (dto: WarehousesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
};
