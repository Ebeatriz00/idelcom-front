export interface WorkerResponseDto {
  workerId?: number;
  businessId?: number;
  jobTitleId?: number;
  jobTitleDescription: string;
  districtId?: number;
  districtDescription: string;
  workerFullName?: string;
  workerName?: string;
  workerLastName?: string;
  documentType?: number; 
  workerDocument?: string;
  dateEntry?: string;
  address?: string;
  status: string;
  workerCount: number;
}