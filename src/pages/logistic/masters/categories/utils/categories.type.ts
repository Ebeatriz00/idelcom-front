import type { CategoriesResponseDto, CategoriesUpsertDto } from "@/application";
import type { PaginationState } from "@tanstack/react-table";

export type PropsTable = {
  data: CategoriesResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: CategoriesResponseDto) => void;
  onToggleStatus: (row: CategoriesResponseDto) => void;
  onDelete: (row: CategoriesResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canExportCategories?: boolean;
  canEditCategories?: boolean;
  canEditStatusCategories?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<CategoriesUpsertDto>;
  onSubmit: (dto: CategoriesUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsFormModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<CategoriesUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: CategoriesUpsertDto) => Promise<void>;
  saving: boolean;
};
