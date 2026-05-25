// form/mapToDefaults.ts
import type { OpportunitiesUpsertDto } from "@/application";
import type { DefaultValues } from "react-hook-form";
import { parseDateOnly, type FormValues } from "./schema";

const today = new Date();

export function mapToFormValues(
  dto?: Partial<OpportunitiesUpsertDto>,
): DefaultValues<FormValues> {
  const normalizeDate = (date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;

    try {
      const d = parseDateOnly(date);
      if (!d) return undefined;
      if (isNaN(d.getTime())) return undefined;

      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } catch {
      return undefined;
    }
  };

  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return {
    linkToken: dto?.linkToken ?? undefined,
    opporDesc: dto?.opporDesc ?? "",
    clientsId: dto?.clientsId ?? undefined,
    contactsId: dto?.contactsId ?? undefined,
    businessLineId: dto?.businessLineId ?? undefined,
    workerId: dto?.workerId ?? undefined,
    currencyId: dto?.currencyId ?? undefined,
    porcentProgressPro: dto?.porcentProgressPro ?? 0,

    negotiationStagesId: dto?.negotiationStagesId,
    opporAmount: dto?.opporAmount ?? 0,

    dateRegister: normalizeDate(dto?.dateRegister) ?? todayNormalized,

    dateFinish: normalizeDate(dto?.dateFinish),
    consultDate: normalizeDate(dto?.consultDate),
    quoDate: normalizeDate(dto?.quoDate),

    isPreOpportunity: dto?.isPreOpportunity ?? false,
    isAprovedViability: dto?.isAprovedViability ?? undefined,
    decisionManager: dto?.decisionManager ?? "",

    followupEnabled: dto?.followupEnabled ?? false,
    followupEveryDay: dto?.followupEveryDay ?? 0,

    isHiring: dto?.isHiring,

    deliverablesHiring:
      dto?.deliverablesHiring?.map((d) => ({
        deliverablesId: d.deliverablesId,
        comment: d.comment ?? "",
        name: d.name ?? (d as any).deliverablesName ?? "",
        dueDate: normalizeDate(d.dueDate) ?? null,
        fromDb: true,
        state: (d as any).state ?? "",
      })) ?? [],
    hiringFiles:
      dto?.hiringFiles?.map((d) => ({
        fileId: d.fileId,
        fileTitle: d.fileTitle ?? "",
        fileUrl: d.fileUrl ?? "",
        relativePath: d.relativePath ?? "",
      })) ?? [],
    flowTypeId: dto?.flowTypeId,
    pmConditionId: dto?.pmConditionId,
    typeOppor: dto?.typeOppor,
    parentOpporId:
      dto?.parentOpporId && Number(dto.parentOpporId) > 0
        ? Number(dto.parentOpporId)
        : undefined,
  } satisfies DefaultValues<FormValues>;
}
