export interface WorkerUpsertDto {
  businessId?: number;
  workerId?: number;
  areaId?: number;
  jobTitleId?: number;
  documentTypeId?: number;
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  bankId?: number;
  prevJob?: string;
  workerName?: string;
  workerLastName?: string;
  workerDocument?: string;
  address?: string;
  phone?: string;
  email?: string;
  birthDate?: Date;
  dateEntry?: Date;
  dateCes?: Date;
  ccBank?: string;
  cciBank?: string;
  salary?: number;
  numberChildren?: number;
  usersBy?: string;
}

export interface WorkerStatusDto {
  workerId: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}
