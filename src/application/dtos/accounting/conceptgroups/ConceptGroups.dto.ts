export interface ConceptGroupsUpsertDto {
  conceptGroupsId?: number;
  businessId?: number;
  conceptTypeId: number;
  code: string;
  description: string;
  usersBy?: string;
}

export interface ConceptGroupsStatusDto {
  conceptGroupsId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}