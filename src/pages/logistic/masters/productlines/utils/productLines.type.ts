import type {
  ProductLinesResponseDto,
  ProductLinesUpsertDto,
} from "@/application";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: ProductLinesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ProductLinesResponseDto) => void;
  onToggleStatus: (row: ProductLinesResponseDto) => void;
  onDelete: (row: ProductLinesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEditProdLines?: boolean;
  canExportProdLines?: boolean;
  canEditStatusProdLines?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<ProductLinesUpsertDto>;
  onSubmit: (dto: ProductLinesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  categoriesLabel?: string;
};
