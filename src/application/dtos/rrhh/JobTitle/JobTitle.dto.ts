// src/application/dtos/rrhh/JobTitle/JobTitle.dto.ts
export interface JobTitleUpsertDto {
  jobTitleId?: number;
  businessId?: number;
  areaId?: number; 
  description?: string;
  usersBy?: string;
}

export interface JobTitleStatusDto {
  jobTitleId?: number;
  businessId?: number;
  status: string;
  usersBy?: string;
  areaId?: number;
  description?: string; 
}