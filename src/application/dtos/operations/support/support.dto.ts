export interface SupportResponseDto {
  supportId: number;
  businessId: number;
  provider: string | null;
  service: string | null;
  url: string | null;
  access: string | null;
  email: string | null;
  username: string | null;
  password: string | null;
  supportState: number | null;
  startDate: string | null;
  expirationDate: string | null;
  comments: string | null;
  remarks: string | null;
  createUser: number;
  createDate: string;
  updateUser: number | null;
  updateDate: string | null;
  status: string | null;
}

export interface SupportCreateDto {
  provider: string | null;
  service: string | null;
  url: string | null;
  access: string | null;
  email: string | null;
  username: string | null;
  password: string | null;
  supportState: number | null;
  startDate: string | null;
  expirationDate: string | null;
  comments: string | null;
  remarks: string | null;
}

export interface SupportUpdateDto extends SupportCreateDto {
  supportId: number;
}
