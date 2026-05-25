import type {
  AssignmentTypeResponseDto,
  AssignmentTypeUpsertDto,
} from "@/application";
import type { PaginationState } from "@/sharedKernel/hooks/tables/useDataTable";

export type PropsTable = {
  data: AssignmentTypeResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: AssignmentTypeResponseDto) => void;
  onToggleStatus: (row: AssignmentTypeResponseDto) => void;
  onDelete: (row: AssignmentTypeResponseDto) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEdit?: boolean;
  canExport?: boolean;
  canEditStatus?: boolean;
};

export type PropsForm = {
  defaultValues?: AssignmentTypeUpsertDto;
  onSubmit: (dto: AssignmentTypeUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: AssignmentTypeUpsertDto;
  onClose: () => void;
  onSubmit: (dto: AssignmentTypeUpsertDto) => Promise<void>;
  saving: boolean;
};
