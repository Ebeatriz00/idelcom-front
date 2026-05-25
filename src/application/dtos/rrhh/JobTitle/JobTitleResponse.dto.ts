// src/application/dtos/rrhh/JobTitle/JobTitleResponse.dto.ts
export interface JobTitleResponseDto {
  jobTitleId: number;
  areaId: number;
  businessId: number;
  description: string;
  status: string;
  areaDescription: string;
  jobTitleCount: number;
}

export interface JobTitleResponseByIdDto {
  jobTitleId: number;
  businessId: number;
  description: string;
  areaId: number;
  areaDescription: string;
}