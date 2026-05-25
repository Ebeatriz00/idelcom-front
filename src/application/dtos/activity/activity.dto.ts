export interface ActivityOpporCreateDto {
  businessId?: number;
  linkToken?: string;
  opporToken?: string;
  projectToken?: string;
  workerOwnerId?: number;
  workerSenderId?: number;
  activityState?: number;
  activityType?: number;
  activityPriority?: number;
  activityMessage?: string;
  messageAddition?: string;
  messageDate?: Date;
  finishDate?: Date;
  usersBy?: number;
}

export interface ActivityOpporDeleteDto {
  linkToken?: string;
  opporToken?: string;
  projectToken?: string;

}

export interface ActivityPriorityOpporDto {
  businessId?: number;
  linkToken?: string;
  opporToken?: string;
  projectToken?: string;
  usersBy?: number;
  status: string;
}

export interface ActivityStateOpporDto {
  businessId?: number;
  linkToken?: string;
  opporToken?: string;
  projectToken?: string;
  usersBy?: number;
  status: string;
}
