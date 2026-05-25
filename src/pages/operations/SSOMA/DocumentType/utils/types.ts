import type {
  SsomaDocumentTypeResponseDto,
  SsomaDocumentTypeUpsertDto,
} from "@/application";
import type { PaginationState } from "@/sharedKernel/hooks/tables/useDataTable";

export type PropsTable = {
  data: SsomaDocumentTypeResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: SsomaDocumentTypeResponseDto) => void;
  onToggleStatus: (row: SsomaDocumentTypeResponseDto) => void;
  onDelete: (row: SsomaDocumentTypeResponseDto) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEdit?: boolean;
  canExport?: boolean;
  canEditStatus?: boolean;
};

export type PropsForm = {
  defaultValues?: SsomaDocumentTypeUpsertDto;
  onSubmit: (dto: SsomaDocumentTypeUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: SsomaDocumentTypeUpsertDto;
  onClose: () => void;
  onSubmit: (dto: SsomaDocumentTypeUpsertDto) => Promise<void>;
  saving: boolean;
};
