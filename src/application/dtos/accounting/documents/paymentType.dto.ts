export interface PaymentTypeUpsertDto {
  paymentTypeId?: number;
  businessId?: number;
  code: string;
  description: string;
  usersBy?: string;
}

export interface PaymentTypeStatusDto {
  paymentTypeId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
