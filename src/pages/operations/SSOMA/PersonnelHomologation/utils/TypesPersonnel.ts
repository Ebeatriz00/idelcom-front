import type {
  HomologationPersonnelRequestDto,
  PersonnelHomologationListItemDto,
  PersonnelOperationsByWorkerItemDto,
  PersonnelHomologationBaseItem,
  PersonnelHomologationGeneralItem,
  PersonnelHomologationOperationsItem,
} from "@/application";

export type PersonnelHomologationFormDefaultValues = {
  homologationPersonnel?: Partial<
    HomologationPersonnelRequestDto["homologationPersonnel"]
  >;
  documents?: HomologationPersonnelRequestDto["documents"];
};

export type PropsTable = {
  selectedId?: number | null;
  onSelect: (row: PersonnelHomologationListItemDto) => void;
  search: string;
  setSearch: (value: string) => void;
};
export type PaginationState = {
  search: string;
  pageIndex: number;
  pageSize: number;
};

export type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export type PropsForm = {
  open?: boolean;
  title?: React.ReactNode;
  workerName?: string;
  workerId?: number;
  loadingDetail?: boolean;
  defaultValues?: PersonnelHomologationFormDefaultValues;
  onClose?: () => void;
  onSubmit: (dto: HomologationPersonnelRequestDto) => void;
  saving?: boolean;
  formId?: string;
  requirementLabel?: string;
};

export type UploadedFileValue = {
  fileName: string;
  fileUrl: string;
  filePath: string;
};
export type PropsDocumentDropzone = {
  requirement?: PersonnelOperationsByWorkerItemDto | null;
  requirementName?: string;
  issueDate?: string;
  expirationDate?: string;
  workerName?: string;
  operationLabel?: string;
  homologationScopeId?: number;
  value?: UploadedFileValue | null;
  disabled?: boolean;
  onUploaded: (file: UploadedFileValue) => void;
  onRemove: () => void;
  onUseInternal?: () => void;
};

export type PersonnelHomologationRequirementItem =
  | PersonnelHomologationGeneralItem
  | PersonnelHomologationOperationsItem;

export type PersonnelHomologationDocumentItem = Partial<PersonnelHomologationBaseItem> & {
  requirementId: number;
  requeriment: string;
  fileName: string;
  fileUrl: string;
  validationStatus: string;
  allowInternalReuse?: number;
  operationsRequirementId?: number;
  sourceDocumentId?: number;
  operationsName?: string;
};

export function getPersonnelHomologationRequirementItemKey(
  item: PersonnelHomologationRequirementItem | PersonnelHomologationDocumentItem,
  index: number,
) {
  return String(
    item.ssomaHomologationPersonnelDocumentId ??
      (item.homologationPersonnelId && item.requirementId
        ? `${item.homologationPersonnelId}-${item.requirementId}`
        : `${item.homologationPersonnelId ?? "h"}-${item.requirementId ?? "r"}-${index}`),
  );
}
