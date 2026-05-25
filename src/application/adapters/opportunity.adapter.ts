import type { OpportunitiesRaw } from "@/core/entities/opportunity.entities";
import type { OpportunitiesDetailDto } from "..";

export const formatDate = (
  input?: string | Date | null,
  withTime = false
): string => {
  if (!input) return "-";

  // convierte Date a string ISO si hace falta
  const iso = input instanceof Date ? input.toISOString() : input;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

export function adaptOpportunity(
  raw: OpportunitiesRaw
): OpportunitiesDetailDto {
  const tasksList = (raw.tasksList ?? []).map((t) => ({
    tasksToken: t.tasksToken,
    priorityToken: t.priorityToken,
    titleTasks: t.titleTasks,
    descTasks: t.descTasks,
    priorityColor: t.priorityColor,
    priorityDesc: t.priorityDesc,
    tasksResp: t.tasksResp,
    statusTasks: t.statusTasks,
    statusProgress: t.statusProgress,
    stateColor: t.stateColor,
    endRegister: t.endRegister,
  }));

  const projectTeamList = (raw.projectTeamList ?? []).map((p) => ({
    teamMember: p.teamMember,
  }));

  const activityList = (raw.activityList ?? []).map((a) => ({
    linkToken: a.linkToken,
    activitys: a.activitys,
    messageAddition: a.messageAddition,
    dateActivity: a.dateActivity,
    workerName: a.workerName,
    activityState: a.activityState,
    activityStateColor: a.activityStateColor,
    activityIcon: a.activityIcon,
    activity: a.activity,
    activityPriority: a.activityPriority,
    activityPriorityColor: a.activityPriorityColor,
  }));

  const filetrackingList = (raw.filetrackingList ?? []).map((f) => ({
    linkToken: f.linkToken,
    fileTitle: f.fileTitle,
    fileUrl: f.fileUrl,
    relativePath: f.relativePath,
    commentFile: f.commentFile,
    dateUpload: f.dateUpload,
    codeOppor: f.codeOppor,
    archiveType: f.archiveType
  }));

  const historyChanges = (raw.historyChanges ?? []).map((h) => ({
    history: h.history,
    usersName: h.usersName,
    dateChange: h.dateChange,
  }));

  return {
    businessId: raw.businessId,
    linkToken: raw.linkToken,
    opporNumber: raw.opporNumber,
    opporDesc: raw.opporDesc,
    clientsName: raw.clientsName,
    clientsDocument: raw.clientsDocument,
    clientsAddress: raw.clientsAddress,
    clientsSector: raw.clientsSector,
    departmentName: raw.departmentName,
    clientsPhone: raw.clientsPhone,
    clientsWeb: raw.clientsWeb,
    salesName: raw.salesName,
    dateFinish: formatDate(raw.dateFinish),
    stateStatusProject: raw.stateStatusProject,
    numPercPro: raw.numPercPro,
    descLineBusiness: raw.descLineBusiness,
    porcentProgressPro: raw.porcentProgressPro,
    opporAmountStr: raw.opporAmountStr,
    dateRegister: raw.dateRegister,
    contactsName: raw.contactsName,
    contactsJob: raw.contactsJob,
    contactsPhone: raw.contactsPhone,
    contactsEmail: raw.contactsEmail,
    contactsType: raw.contactsType,
    stateProject: raw.stateProject,
    porcentProgressAdv: raw.porcentProgressAdv,
    porcentProgressTxt: raw.porcentProgressTxt,
    workerResp: raw.workerResp,
    finishDateProject: raw.finishDateProject,
    finishDateProjectTxt: raw.finishDateProjectTxt,
    reasonRejection: raw.reasonRejection,

    tasksList,
    projectTeamList,
    activityList,
    filetrackingList,
    historyChanges,
  };
}
