export interface ClinicResponseDto {
  clinicId: number;
  businessId: number;
  clinicName: string;
  documentNumber: string | null;
  createDate: string;
  status: string;
}

export interface ClinicCreateDto {
  businessId?: number;
  clinicName: string;
  documentNumber: string | null;
  createUser?: number;
}

export interface ClinicUpdateDto extends ClinicCreateDto {
  clinicId: number;
}
