import type { OpportunitiesStateUpdateDto } from "@/application";
import type { DefaultValues } from "react-hook-form";
import type { FormStateValues } from "./shemaState";

export function mapToFormStateValues(
  dto?: Partial<OpportunitiesStateUpdateDto>,
): DefaultValues<FormStateValues> {
  if (!dto) {
    return {
      linkToken: "",
      stateOpporId: 0,

      reasonRejectionId: undefined,
      reasonRejection: "",
      proposalComment: "",

      wonComment: undefined as any,
      excelFile: undefined as any,
      currencyId: undefined,

      viabilityScore: undefined,
      compliance: undefined,
      partialCompliance: undefined,
      nonCompliance: undefined,
      minScore: undefined,
      maxScore: undefined,

      authority: undefined,
      authorityDesc: "",
      budget: undefined,
      budgetDesc: "",
      need: undefined,
      needDesc: "",
      term: undefined,
      termDesc: "",

      contractMethod: undefined,
      contractMethodDesc: "",

      requiresIsos: undefined,
      requiresIsosDesc: "",
      companyExperience: undefined,
      companyExperienceDesc: "",
      workerExperience: undefined,
      workerExperienceDesc: "",
      staffExperience: undefined,
      staffExperienceDesc: "",
      ability: undefined,
      abilityDesc: "",
      shedule: undefined,
      sheduleDesc: "",
      deliverables: [],
      deliverablesHiring: [],
      observations: [],
      proposalPresentated: undefined,
      typeObsClientsId: undefined,
      reasonObsClients: "",
      typeObsEconomic: undefined,
      negotationOutcomeId: undefined,
      brandAproach: undefined,
      brandAproachDesc: "",
      TechnicalChanges: undefined,
      TechnicalChangesDesc: "",

      fileTitle: "",
      relativePath: "",
      archiveType: "",
      quotationVerId: undefined,
      callDate: undefined,
      followupEnabled: undefined,
      pmConditionId: undefined,
    };
  }

  return {
    linkToken: dto.linkToken ?? "",
    stateOpporId: dto.stateOpporId ?? 0,

    dateFinish: dto.dateFinish,
    reasonRejectionId: dto.reasonRejectionId ?? undefined,
    reasonRejection: dto.reasonRejection ?? "",
    proposalComment: dto.proposalComment ?? "",

    viabilityScore: dto.viabilityScore ?? undefined,
    compliance: dto.compliance ?? undefined,
    partialCompliance: dto.partialCompliance ?? undefined,
    nonCompliance: dto.nonCompliance ?? undefined,
    minScore: dto.minScore ?? undefined,
    maxScore: dto.maxScore ?? undefined,

    authority: dto.authority != null ? Number(dto.authority) : undefined,
    authorityDesc: dto.authorityDesc ?? "",

    budget: dto.budget != null ? Number(dto.budget) : undefined,
    budgetDesc: dto.budgetDesc ?? "",

    need: dto.need != null ? Number(dto.need) : undefined,
    needDesc: dto.needDesc ?? "",

    term: dto.term != null ? Number(dto.term) : undefined,
    termDesc: dto.termDesc ?? "",

    requiresIsos:
      dto.requiresIsos != null ? Number(dto.requiresIsos) : undefined,
    requiresIsosDesc: dto.requiresIsosDesc ?? "",

    contractMethod:
      dto.contractMethod != null ? Number(dto.contractMethod) : undefined,
    contractMethodDesc: dto.contractMethodDesc ?? "",

    companyExperience:
      dto.companyExperience != null ? Number(dto.companyExperience) : undefined,
    companyExperienceDesc: dto.companyExperienceDesc ?? "",

    workerExperience:
      dto.workerExperience != null ? Number(dto.workerExperience) : undefined,
    workerExperienceDesc: dto.workerExperienceDesc ?? "",

    staffExperience:
      dto.staffExperience != null ? Number(dto.staffExperience) : undefined,
    staffExperienceDesc: dto.staffExperienceDesc ?? "",

    ability: dto.ability != null ? Number(dto.ability) : undefined,
    abilityDesc: dto.abilityDesc ?? "",

    shedule: dto.shedule != null ? Number(dto.shedule) : undefined,
    sheduleDesc: dto.sheduleDesc ?? "",

    deliverables:
      dto.deliverables?.map((d) => ({
        deliverablesId: d.deliverablesId,
        comment: d.comment ?? "",
        name: d.name ?? (d as any).deliverablesName ?? "",
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        fromDb: true,
        state: (d as any).state ?? "",
      })) ?? [],

    deliverablesHiring:
      dto?.deliverablesHiring?.map((h) => ({
        deliverablesId: h.deliverablesId,
        comment: h.comment ?? "",
        name: h.name ?? (h as any).deliverablesName ?? "",
        dueDate: h.dueDate ? new Date(h.dueDate) : null,
        fromDb: true,
        state: (h as any).state ?? "",
      })) ?? [],

    observations:
      dto?.observations?.map((o) => ({
        obsId: o.obsId,
        obsSeverity: o.obsSeverity,
        obsSeverityDesc: o.obsSeverityDesc ?? "",
        obsComment: o.obsComment ?? "",
        dueDate: o.dueDate ? new Date(o.dueDate) : null,
      })) ?? [],

    wonComment: dto.wonComment ?? undefined,
    excelFile: dto.excelFile ?? undefined,
    currencyId: dto.currencyId ?? undefined,
    proposalPresentated: dto.proposalPresentated ?? undefined,
    negotationOutcomeId: dto.negotationOutcomeId ?? undefined,
    typeObsClientsId: dto.typeObsClientsId ?? undefined,
    reasonObsClients: dto.reasonObsClients ?? "",
    typeObsEconomic: dto.typeObsEconomic ?? undefined,

    brandAproach: dto.brandAproach,
    brandAproachDesc: dto.brandAproachDesc ?? "",
    TechnicalChanges: dto.TechnicalChanges,
    TechnicalChangesDesc: dto.TechnicalChangesDesc ?? "",
    isReEvaluation: dto.isReEvaluation ?? undefined,

    fileTitle: dto.fileTitle ?? "",
    fileUrl: dto.fileUrl ?? "",
    relativePath: dto.relativePath ?? "",
    archiveType: dto.archiveType ?? "",

    opporNumber: dto.opporNumber,
    quotationVerId: dto.quotationVerId ?? undefined,
    callDate: dto.callDate ?? undefined,
    followupEnabled: dto.followupEnabled ?? undefined,
    stateOpporGenId: dto.stateOpporGenId,
    pmConditionId: dto.pmConditionId ?? undefined,
  };
}
