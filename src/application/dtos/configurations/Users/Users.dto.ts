export interface UsersUpsertDto {
  usersId?: number;
  businessId?: number;
  workerId?: number;
  usersName: string;
  usersLastName: string;
  usersCode: string;
  usersEmail: string;
  documentTypeId?: number;
  profilesId?: number;
  usersDocument: string;
  usersPhoto: string;
  usersPassword: string;
  usersBy?: string;
}

export interface UsersStatusDto {
  usersId?: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}

export interface UsersPasswordChangeDto {
  usersId?: number;
  businessId?: number;
  usersPassword: string;
  usersBy?: string;
}
