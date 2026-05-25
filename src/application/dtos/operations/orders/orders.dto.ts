import type { OperationsProjectConfigCreateDto } from "../configProject/configProject.dto";

export interface OrdersProjectDto {
  businessId: number;
  proyectManagerId: number;
  qualitySupervisorId: number;
  configProject: OperationsProjectConfigCreateDto[];
  teamSupervisor: number[];
  teamLederTechnical: number[];

  usersBy: number;
}

export interface OrdersResponseDto {
  operationsId?: number;
  opporToken?: string;
  businessId?: number;
  opporId?: number;
  opporNum?: string;
  opporDesc?: string;
  clientsName?: string;
  commercial?: string;
  responsible?: string;
  qualitySupervisor?: string;
  projectManager?: string;
  ssoma?: string;
  status?: string;
  ssomaIds?: string;
  requeredSsoma?: boolean;
  plannedStartDate?: string;
  plannedEndDate?: string;

  // Estos podrían venir del mapeo o ser legacy, los mantenemos opcionales
  startDate?: string;
  endDate?: string;
  progressPercentage?: number;
  typeOppor?: string | null;
  parentOpportunityId?: number | null;
  additionalSequence?: number | null;
  stateColor?: string | null;
}

export interface RegisterSsoma {
  operationsId?: number;
  businessId?: number;
  requeredSsoma?: boolean;
  workerId?: number[];
  usersBy?: number;
}

export interface CreateQualitySupervisor {
  operationsId?: Number;
  businessId?: Number;
  workerId?: number;
  usersBy?: number;
}

export interface CreateProjectManager {
  operationsId?: Number;
  businessId?: Number;
  workerId?: number;
  usersBy?: number;
}
