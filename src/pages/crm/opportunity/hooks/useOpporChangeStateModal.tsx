import type { OpportunitiesStateUpdateDto } from "@/application";
import { CacheController } from "@/cache/cacheController";
import {
  closeAlert,
  showApiError,
  useOpportunitiesMutations,
  useOpportunitiesStateById,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useOpporChangeStateModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [forceReset, setForceReset] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);

  const {
    data: detail,
    isFetching,
    isSuccess,
  } = useOpportunitiesStateById(editingId);

  const { updateChangeStateMut } = useOpportunitiesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<OpportunitiesStateUpdateDto> = {
        reasonRejection: "",
        reasonRejectionId: undefined,
        proposalComment: "",
        deliverables: [],
        deliverablesHiring: [],
        observations: [],
        wonComment: undefined,
        excelFile: undefined,
        currencyId: undefined,
        negotationOutcomeId: undefined,
        typeObsClientsId: undefined,
        reasonObsClients: "",
        typeObsEconomic: undefined,
        quotationVerId: undefined,
        callDate: undefined,
        followupEnabled: undefined,
        pmConditionId: undefined,
      };
      return base;
    }

    const d = detail ?? ({} as any);

    return {
      linkToken: d.linkToken ?? editingId,

      stateOpporId: d.stateOpporId,
      stateOpporLabel: d.stateOpporName,

      reasonRejectionId: d.reasonRejectionId,
      reasonRejectionLabel: d.reasonRejectionName,

      dateFinish: d.dateFinish ?? undefined,
      reasonRejection: d.reasonRejection,
      proposalComment: d.proposalComment,
      viabilityScore: d.viabilityScore,
      compliance: d.compliance,
      partialCompliance: d.partialCompliance,
      nonCompliance: d.nonCompliance,

      authority: d.authority,
      authorityDesc: d.authorityDesc,

      budget: d.budget,
      budgetDesc: d.budgetDesc,

      need: d.need,
      needDesc: d.needDesc,

      term: d.term,
      termDesc: d.termDesc,

      contractMethod: d.contractMethod,
      contractMethodDesc: d.contractMethodDesc,

      requiresIsos: d.requiresIsos,
      requiresIsosDesc: d.requiresIsosDesc,

      companyExperience: d.companyExperience,
      companyExperienceDesc: d.companyExperienceDesc,

      workerExperience: d.workerExperience,
      workerExperienceDesc: d.workerExperienceDesc,

      staffExperience: d.staffExperience,
      staffExperienceDesc: d.staffExperienceDesc,

      ability: d.ability,
      abilityDesc: d.abilityDesc,

      shedule: d.shedule,
      sheduleDesc: d.sheduleDesc,

      deliverables: d.deliverables ?? [],
      deliverablesHiring: d.deliverablesHiring ?? [],
      observations: d.observations ?? [],
      exRate: d.exRate,
      price: d.price,
      cost: d.cost,
      utility: d.utility,
      currencyId: d.currencyId,
      wonComment: d.wonComment,
      proposalPresentated: d.proposalPresentated,
      negotationOutcomeId: d.negotationOutcomeId,
      typeObsClientsId: d.typeObsClientsId,
      reasonObsClients: d.reasonObsClients,
      typeObsEconomic: d.typeObsEconomic,

      dateRegister: d.dateRegister,
      isHiring: d.isHiring,
      isReEvaluation: d.isReEvaluation,
      brandAproach: d.brandAproach,
      brandAproachDesc: d.brandAproachDesc,
      TechnicalChanges: d.TechnicalChanges,
      TechnicalChangesDesc: d.TechnicalChangesDesc,
      fileTitle: d.fileTitle,
      fileUrl: d.fileUrl,
      relativePath: d.relativePath,
      archiveType: d.archiveType,
      opporNumber: d.opporNumber,
      quotationVerId: d.quotationVerId,
      callDate: d.callDate,
      followupEnabled: d.followupEnabled,
      stateOpporGenId: d.stateOpporGenId,
      pmConditionId: d.pmConditionId,
    } as Partial<OpportunitiesStateUpdateDto> & {
      stateOpporLabel?: string;
      reasonRejectionLabel?: string;
      quotationVerNoLabel?: string;
      typeObsClientsLabel?: string;
      typeObsEconomicLabel?: string;
      pmConditionLabel?: string;
    };
  }, [editingId, detail, forceReset]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
    setForceReset((prev) => prev + 1);
  }

  function openEdit(id: string) {
    if (open && editingId === id) {
      close();
      setTimeout(() => openEdit(id), 100);
      return;
    }

    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setForceReset((prev) => prev + 1);
    }, 300);
  }

  async function submit(dto: OpportunitiesStateUpdateDto) {
    try {
      setUploadPct(0);

      await updateChangeStateMut.mutateAsync({
        dto,
        onProgress: (p) => setUploadPct(p),
      });

      await CacheController.invalidate("preSales", "hirings");

      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
      setUploadPct(0);
    }
  }
  const saving = updateChangeStateMut.isPending;

  return {
    open,
    isFetching,
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    uploadPct,
    saving,
    editingId,
  };
}
