export interface OpportunitiesDetailDto {
  businessId: number;
  linkToken: string;
  opporNumber: string;
  opporDesc: string;
  clientsName?: string;
  clientsDocument?: string;
  clientsAddress?: string;
  clientsSector?: string;
  departmentName?: string;
  clientsPhone?: string;
  clientsWeb?: string;
  salesName?: string;
  dateFinish?: string;
  stateStatusProject?: string;
  numPercPro?: number;
  descLineBusiness?: string;
  porcentProgressPro?: number;
  opporAmountStr?: string;
  dateRegister?: Date;
  contactsName?: string;
  contactsJob?: string;
  contactsPhone?: string;
  contactsEmail?: string;
  contactsType?: string;
  stateProject?: string;
  porcentProgressAdv?: number;
  porcentProgressTxt?: string;
  workerResp?: string;
  finishDateProject?: Date;
  finishDateProjectTxt?: string;
  reasonRejection?: string 

  tasksList: Array<{
    tasksToken: string;
    priorityToken?: string;
    titleTasks?: string;
    descTasks?: string;
    priorityColor?: string;
    priorityDesc?: string;
    tasksResp?: string;
    statusTasks?: string;
    statusProgress?: number;
    stateColor?: string;
    endRegister?: Date;
  }>;

  projectTeamList: Array<{
    teamMember?: string;
  }>;

  activityList: Array<{
    linkToken: string;
    activitys?: string;
    messageAddition?: string;
    dateActivity?: Date;
    workerName?: string;
    activityState?: string;
    activityStateColor?: string;
    activityIcon?: string;
    activity?: string;
    activityPriority?: string;
    activityPriorityColor?: string;
  }>;

  filetrackingList: Array<{
    linkToken: string;
    fileTitle?: string;
    fileUrl?: string;
    relativePath?: string;
    commentFile?: string;
    dateUpload?: Date;
    codeOppor?: string;
    archiveType?: string;
  }>;

  historyChanges: Array<{
    history?: string;
    usersName?: string;
    dateChange?: Date;
  }>;
}

export interface FileTrackingOpporCreateDto {
  businessId?: number;
  opporToken?: string;
  archiveType?: string;
  fileTitle?: string;
  relativePath?: string;
  fileUrl?: string;
  comment?: string;
  usersBy?: number;
}

export interface FileTrackingOpperDeleteDto {
  linkToken?: number;
  opporToken?: string;
}
