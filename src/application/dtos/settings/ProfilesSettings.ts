export type ProfileData = {
  name: string;
  lastName: string;
  email: string;
  documentType: string;
  document: string;
  position: string;
  avatarUrl: string;
};

export interface ProfilesSeattingView {
  usersId: number;
  usersName: string;
  usersLastName: string;
  usersEmail: string;
  documentType: string;
  descriptionProfiles: string;
  usersDocument: string;
  usersPhoto: string;
}

export interface ProfilesSeattingUpate {
  businessId: number;
  usersId: number;
  usersName: string;
  usersLastName: string;
  usersEmail: string;
  usersDocument: string;
  usersPhoto: string;
}
