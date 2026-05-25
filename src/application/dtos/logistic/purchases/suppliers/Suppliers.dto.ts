export interface SuppliersUpsertDto {
  suppliersId?: number;
  businessId?: number;
  supplierTypeId?: number;
  suppliersGroupsId?: number;
  supplierGroupsId?: number;
  paymentMethodId?: number;
  paymentConditionId?: number;
  documentTypeId?: number;
  documentNumber?: string;
  supplierName?: string;
  tradeName?: string;
  contactName?: string;
  address?: string;
  departamentId?: number | null;
  departmentId?: number | null;
  provinceId?: number | null;
  districtId?: number | null;
  phone?: string;
  mobile?: string;
  movil?: string;
  email?: string;
  website?: string;
  sunatStatus?: string;
  sunatCondition?: string;
  retainerAgent?: boolean;
  perceptionAgent?: boolean;
  detractionAgent?: boolean;
  foreignAgent?: boolean;
  observation?: string;
}

export interface SuppliersStatusDto {
  suppliersId?: number;
  businessId?: number;
  status?: string;
}
