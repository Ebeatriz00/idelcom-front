import type { SupportResponseDto, SupportCreateDto, SupportUpdateDto } from "@/application/dtos/operations/support/support.dto";
import type { PaginationState } from "@tanstack/react-table";

export interface PropsTable {
  data: SupportResponseDto[];
  total: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: (updater: any) => void;
  onEdit: (row: SupportResponseDto) => void;
  onDelete: (row: SupportResponseDto) => void;
  search: string;
  onSearchChange: (value: string) => void;
  canExport?: boolean;
}

export interface PropsModal {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: any;
  onClose: () => void;
  onSubmit: (dto: SupportCreateDto | SupportUpdateDto) => void;
  saving: boolean;
}

export interface PropsForm {
  defaultValues?: any;
  onSubmit: (dto: SupportCreateDto | SupportUpdateDto) => void;
  saving: boolean;
  formId: string;
  showActions?: boolean;
}
