import type { PersonnelHomologationFormValues } from "../../utils/personnelHomologation.schema";

export const inputClass =
  "w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100";

export const textareaClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100";

export const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export const createEmptyDocument =
  (): PersonnelHomologationFormValues["documents"][number] => ({
    requirementId: 0,
    fileName: "",
    fileUrl: "",
    filePath: "",
    localUploadToken: "",
    issueDate: "",
    expirationDate: "",
    reviewDate: "",
    observation: "",
  });
