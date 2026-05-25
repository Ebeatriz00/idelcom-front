export interface CommentDto {
  commentToken: string;
  businessId: number;
  linkToken: string;
  message: string;
  createdAt: Date;
  isInternal?: boolean;
  createdBy: number;
  createdByName: string;
  
  visibilityId: number;
  audienceAreaIds: number[];
}

export interface CreateCommentInput {
  businessId?: number;
  linkToken?: string;
  message: string;
  isInternal?: boolean;
  usersBy?: number;
}
