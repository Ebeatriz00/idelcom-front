import type { BrandsResponseDto, BrandsUpsertDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: BrandsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: BrandsResponseDto) => void;
  onToggleStatus: (row: BrandsResponseDto) => void;
  onDelete: (row: BrandsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditBrands?: boolean;
  canExportBrands?: boolean;
  canEditStatusBrands?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<BrandsUpsertDto>;
  onSubmit: (dto: BrandsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsFormModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<BrandsUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: BrandsUpsertDto) => Promise<void>;
  saving: boolean;
};
