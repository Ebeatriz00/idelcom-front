import type { ProductsResponseDto } from "@/application";
import type { PaginationState } from "@/sharedKernel";
import type { ProductsUpsertFormValues } from "./products.schema";

export type PropsTable = {
  data: ProductsResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: ProductsResponseDto) => void;
  onOpenGallery: (row: ProductsResponseDto) => void;
  onToggleStatus: (row: ProductsResponseDto) => void;
  onDelete: (row: ProductsResponseDto) => void;
  onVisibleCountChange?: (n: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
  categoryFilter?: number;
  productTypeFilter?: number;
  brandFilter?: number;
  onCategoryFilterChange: (value?: number) => void;
  onProductTypeFilterChange: (value?: number) => void;
  onBrandFilterChange: (value?: number) => void;
  canEditProducts?: boolean;
  canExportProducts?: boolean;
  canEditStatusProducts?: boolean;
};

export type PropsForm = {
  defaultValues?: Partial<ProductsUpsertFormValues>;
  onSubmit: (data: ProductsUpsertFormValues) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  categoriesLabel?: string;
  productLinesLabel?: string;
  brandsLabel?: string;
  productTypesLabel?: string;
  uomLabel?: string;
};

export type PropsFormModal = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues?: Partial<ProductsUpsertFormValues>;
  onClose: () => void;
  onSubmit: (data: ProductsUpsertFormValues) => Promise<void> | void;
  saving?: boolean;
  categoriesLabel?: string;
  productLinesLabel?: string;
  brandsLabel?: string;
  productTypesLabel?: string;
  uomLabel?: string;
};
