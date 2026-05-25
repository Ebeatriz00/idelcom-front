import type { OpportunitiesUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useOpportunitiesById,
  useOpportunitiesMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useOpportunitiesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = !!editingId;

  const {
    data: detail,
    isFetching,
    isSuccess,
  } = useOpportunitiesById(editingId, {
    enabled: open && isEditing,
  });

  const { createMut, updateMut } = useOpportunitiesMutations();

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<OpportunitiesUpsertDto> = {
        opporDesc: "",
      };
      return base;
    }
    const d = detail ?? ({} as any);

    return {
      linkToken: d.linkToken ?? editingId,
      opporDesc: d.opporDesc,

      clientsId: d.clientsId,
      contactsId: d.contactsId,
      clientsLabel: d.clientsName,

      businessLineId: d.businessLineId,
      businessLineLabel: d.businessLineName,

      workerId: d.workerId,
      workerLabel: d.workerName,

      currencyId: d.currencyId,
      currencyLabel: d.currencyName,

      dateRegister: d.dateRegister,
      dateFinish: d.dateFinish,
      opporAmount: d.opporAmount,
      porcentProgressPro: d.porcentProgressPro,
      consultDate: d.consultDate,
      quoDate: d.quoDate,

      isAprovedViability: d.isAprovedViability,
      isPreOpportunity: d.isPreOpportunity,
      decisionManager: d.decisionManager,
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

      minScore: d.minScore,
      followupEnabled: d.followupEnabled,
      followupEveryDay: d.followupEveryDay,
      negotiationStagesId: d.negotiationStagesId,
      isHiring: d.isHiring,
      deliverablesHiring: d.deliverablesHiring ?? [],
      hiringFiles: d.hiringFiles ?? [],
      flowTypeId: d.flowTypeId,
      pmConditionId: d.pmConditionId,
      typeOppor: d.typeOppor,
      parentOpporId: d.parentOpporId,
    } as Partial<OpportunitiesUpsertDto> & {
      clientsLabel?: string;
      businessLineLabel?: string;
      stateOpporLabel?: string;
      workerLabel?: string;
      currencyLabel?: string;
      contactsLabel?: string;
      negotiationStagesLabel?: string;
      flowTypeLabel?: string;
      pmConditionLabel?: string;
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(
    dto: OpportunitiesUpsertDto,
  ): Promise<{ Id: number; opporNum: string }> {
    try {
      if (dto.linkToken == null) {
        const res = await createMut.mutateAsync(dto);
        const Id = (res as any).id ?? (res as any).Id;
        const opporNum = (res as any).opporNum ?? (res as any).OpporNum;

        if (!Id || !opporNum)
          throw new Error(res?.message ?? "No devolvió id/opporNum.");
        return { Id: Number(Id), opporNum: String(opporNum) };
      } else {
        const res = await updateMut.mutateAsync(dto);
        const Id = (res as any).id ?? (res as any).Id ?? Number(dto.linkToken);
        const opporNum = (res as any).opporNum ?? (res as any).OpporNum ?? "";
        return { Id: Number(Id), opporNum: String(opporNum) };
      }
    } catch (err) {
      showApiError(err);
      throw err;
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}
