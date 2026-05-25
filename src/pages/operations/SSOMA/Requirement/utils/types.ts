import type {
  RequirementResponseItemDto,
  RequirementUpsertDto,
} from "@/application/dtos/operations/requirement/requeriment.dto";
import type { PaginationState } from "@/sharedKernel";

export type PropsTable = {
  data: RequirementResponseItemDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((p: PaginationState) => PaginationState),
  ) => void;
  onEdit: (row: RequirementResponseItemDto) => void;
  onToggleStatus: (row: RequirementResponseItemDto) => void;
  onDelete: (row: RequirementResponseItemDto) => void;
  search: string;
  onSearchChange: (q: string) => void;
  canEdit?: boolean;
  canExport?: boolean;
  canEditStatus?: boolean;
};
export type PropsForm = {
  defaultValues?: RequirementUpsertDto;
  onSubmit: (dto: RequirementUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
};

export type PropsModal = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: RequirementUpsertDto;
  onClose: () => void;
  onSubmit: (dto: RequirementUpsertDto) => Promise<void>;
  saving: boolean;
};
