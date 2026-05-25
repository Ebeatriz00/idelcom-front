import type {
  ProductTypesResponseDto,
  ProductTypesUpsertDto,
} from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: ProductTypesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ProductTypesResponseDto) => void;
  onToggleStatus: (row: ProductTypesResponseDto) => void;
  onDelete: (row: ProductTypesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditProdType?: boolean;
  canExportProdType?: boolean;
  canEditStatusProdType?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<ProductTypesUpsertDto>;
  onSubmit: (dto: ProductTypesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<ProductTypesUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: ProductTypesUpsertDto) => Promise<void>;
  saving: boolean;
};
