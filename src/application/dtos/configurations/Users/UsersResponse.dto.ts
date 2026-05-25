export interface UsersResponseDto {
  businessId: number;
  usersId: number;
  user: string;
  documentType: string;
  usersDocument: string;
  descriptionProfiles: string;
  usersPhoto: string;
  status: string;
  usersBy?: string;
}

export interface UsersResponseIdDto {
  businessId: number;
  usersId: number;
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
}
