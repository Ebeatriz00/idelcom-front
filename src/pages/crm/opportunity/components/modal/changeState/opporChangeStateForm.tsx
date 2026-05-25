import type {
  DeliverableItemDto,
  ObservationOpporItemDto,
  OpportunitiesStateUpdateDto,
} from "@/application";
import {
  QuotationVersionNoOptions,
  safeFileName,
  uploadByArchiveType,
  usePaymentConditionOptions,
  useStateOpportunityOptions,
  useViabilityLimit,
} from "@/sharedKernel";
import { useReasonRejectionOptions } from "@/sharedKernel/hooks/reason-rejection/reason-rejection";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useCrmOpporPerms } from "../../../hooks/oppor.perms";
import { RHFDate } from "../../detail/modal/form/RHFDate";
import { RHFSearchSelect } from "../../detail/modal/form/RHFSearchSelect";
import { RHFTextarea } from "../form/fields";
import { ViabilitySection } from "../form/viabilitySection";
import {
  ACTION_STATES,
  ensureSelectedOption,
  NEGOTATION_STATES,
  RE_EVALUATION,
} from "./form/groupStates";
import { mapToFormStateValues } from "./form/mapToFormStateValues";
import { RHFFileUpload } from "./form/RHFFileUpload";
import { createSchemaState, type FormStateValues } from "./form/shemaState";
import { HiringDeliverablesSection } from "./hiringDeliverablesSection";
import { ObsOpporSection } from "./obsOpporSection";
import { OpporDeliverablesSection } from "./opporDeliverablesSection";

type Props = {
  defaultValues?: Partial<OpportunitiesStateUpdateDto>;
  onSubmit: (dto: OpportunitiesStateUpdateDto) => void;
  saving?: boolean;
  uploadPct?: number;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  stateOpporLabel?: string;
  currencyLabel?: string;
  reasonRejectionLabel?: string;
  quotationVerNoLabel?: string;
  loadingDetail?: boolean;
  pmConditionLabel?: string;
};

const STATE = {
  PROSPECT: 1,
  ANALYSIS: 2,
  OPPORTUNITY: 3,
  PROPOSAL: 4,
  NO_PRESENTED: 5,
  OBS: 6,
  REVIEW: 7,
  NEGOTATION: 8,
  STANDBY: 10,
  LOST: 11,
  DISCARDED: 12,
  OBS_CLIENT: 17,
  WON: 19,
} as const;

const VIABILITY_FIELDS = [
  "minScore",
  "maxScore",
  "viabilityScore",
  "compliance",
  "partialCompliance",
  "nonCompliance",

  "authority",
  "budget",
  "need",
  "term",
  "companyExperience",
  "workerExperience",
  "staffExperience",
  "ability",
  "abilityDesc",
  "shedule",

  "authorityDesc",
  "budgetDesc",
  "needDesc",
  "termDesc",
  "companyExperienceDesc",
  "workerExperienceDesc",
  "staffExperienceDesc",
  "sheduleDesc",

  "contractMethod",
  "contractMethodDesc",
  "requiresIsos",
  "requiresIsosDesc",
] as const satisfies readonly (keyof FormStateValues)[];

type Flags = {
  isLosts: boolean;
  isLost: boolean;
  isObs: boolean;
  isWon: boolean;
  isProposal: boolean;
  isAnalysis: boolean;
  withViability: boolean;
  isNegotiation: boolean;
};

function computeFlags(
  stateOpporId: unknown,
  canCreateOpporManager: boolean,
): Flags {
  const LOST_SET = new Set<number>([
    STATE.STANDBY,
    STATE.LOST,
    STATE.DISCARDED,
  ]);

  const s = Number(stateOpporId ?? 0);
  const isLosts = LOST_SET.has(s);
  const isLost = s === STATE.LOST;
  const isObs = s === STATE.OBS;
  const isWon = s === STATE.WON;
  const isProposal = s === STATE.PROPOSAL;
  const isAnalysis = s === STATE.ANALYSIS;
  const isNegotiation = s === STATE.NEGOTATION;

  const withViability = isAnalysis && !canCreateOpporManager;

  return {
    isLosts,
    isLost,
    isObs,
    isWon,
    isProposal,
    isAnalysis,
    isNegotiation,
    withViability,
  };
}

/** ✅ cálculo derivado */
function computeViabilityFrom(values: Partial<FormStateValues>) {
  const raw = [
    values.requiresIsos,
    values.authority,
    values.budget,
    values.need,
    values.term,
    values.companyExperience,
    values.workerExperience,
    values.staffExperience,
    values.ability,
    values.shedule,
    values.brandAproach,
    values.TechnicalChanges,
  ];

  const nums = raw.filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v),
  );

  const compliance = nums.filter((v) => v === 1).length;
  const partialCompliance = nums.filter((v) => v === 2).length;
  const nonCompliance = nums.filter((v) => v === 3).length;

  const total = compliance + partialCompliance + nonCompliance;
  const viabilityScore =
    total > 0 ? Number(((compliance / total) * 100).toFixed(0)) : 0;

  return { compliance, partialCompliance, nonCompliance, viabilityScore };
}

function buildUpdateDto(
  vals: FormStateValues,
  defaults: Partial<OpportunitiesStateUpdateDto> | undefined,
  flags: Flags,
  viabilityCalc: {
    compliance: number;
    partialCompliance: number;
    nonCompliance: number;
    viabilityScore: number;
  },
  ctx: {
    isEnteringProposalFromAnalysis: boolean;
  },
): OpportunitiesStateUpdateDto {
  const base: OpportunitiesStateUpdateDto = {
    linkToken: vals.linkToken ?? defaults?.linkToken,
    businessId: defaults?.businessId ?? 0,
    usersBy: defaults?.usersBy ?? 0,
    stateOpporId: vals.stateOpporId,
    stateOpporGenId: vals.stateOpporGenId,
  };

  if (flags.isLosts) {
    base.reasonRejectionId = vals.reasonRejectionId;
    base.reasonRejection = vals.reasonRejection;
  }
  if (flags.isLost) {
    const followupEnabled = vals.followupEnabled ?? false;

    base.followupEnabled = followupEnabled;

    base.callDate = followupEnabled ? (vals.callDate ?? undefined) : undefined;
  }

  if (flags.withViability) {
    base.minScore = vals.minScore ?? 0;
    base.maxScore = vals.maxScore ?? 0;

    base.compliance = viabilityCalc.compliance;
    base.partialCompliance = viabilityCalc.partialCompliance;
    base.nonCompliance = viabilityCalc.nonCompliance;
    base.viabilityScore = viabilityCalc.viabilityScore;

    base.authority = vals.authority;
    base.authorityDesc = vals.authorityDesc;

    base.budget = vals.budget;
    base.budgetDesc = vals.budgetDesc;

    base.need = vals.need;
    base.needDesc = vals.needDesc;

    base.term = vals.term;
    base.termDesc = vals.termDesc;

    base.contractMethod = vals.contractMethod;
    base.contractMethodDesc = vals.contractMethodDesc;

    base.requiresIsos = vals.requiresIsos;
    base.requiresIsosDesc = vals.requiresIsosDesc;

    base.companyExperience = vals.companyExperience;
    base.companyExperienceDesc = vals.companyExperienceDesc;

    base.workerExperience = vals.workerExperience;
    base.workerExperienceDesc = vals.workerExperienceDesc;

    base.staffExperience = vals.staffExperience;
    base.staffExperienceDesc = vals.staffExperienceDesc;

    base.ability = vals.ability;
    base.abilityDesc = vals.abilityDesc;
    base.shedule = vals.shedule;
    base.sheduleDesc = vals.sheduleDesc;
    base.brandAproach = vals.brandAproach;
    base.brandAproachDesc = vals.brandAproachDesc ?? "";
    base.TechnicalChanges = vals.TechnicalChanges;
    base.TechnicalChangesDesc = vals.TechnicalChangesDesc ?? "";

    base.deliverables = vals.deliverables as DeliverableItemDto[] | undefined;
    base.deliverablesHiring = vals.deliverablesHiring as
      | DeliverableItemDto[]
      | undefined;
    base.isReEvaluation = vals.isReEvaluation;
  }

  if (flags.isObs) {
    base.observations = vals.observations as
      | ObservationOpporItemDto[]
      | undefined;
  }

  if (flags.isWon) {
    base.wonComment = vals.wonComment ?? defaults?.wonComment;
    base.quotationVerId = vals.quotationVerId ?? defaults?.quotationVerId;
  } else {
    base.wonComment = defaults?.wonComment;
    base.quotationVerId = defaults?.quotationVerId;
  }

  // ✅ PROPUESTA: SOLO si entras desde opportunidad
  if (flags.isProposal && ctx.isEnteringProposalFromAnalysis) {
    base.proposalPresentated =
      vals.proposalPresentated ?? defaults?.proposalPresentated ?? false;

    base.proposalComment = vals.proposalComment ?? defaults?.proposalComment;
    base.fileTitle = vals.fileTitle ?? defaults?.fileTitle;
    base.excelFile = vals.excelFile ?? defaults?.excelFile;
    base.relativePath = vals.relativePath ?? defaults?.relativePath;
    base.archiveType = vals.archiveType ?? defaults?.archiveType;
    base.fileUrl = vals.fileUrl ?? defaults?.fileUrl;
    base.opporNumber = vals.opporNumber;
    base.pmConditionId = vals.pmConditionId ?? defaults?.pmConditionId;
  } else {
    base.proposalPresentated = defaults?.proposalPresentated;
    base.excelFile = defaults?.excelFile;
    base.proposalComment = defaults?.proposalComment;
  }

  // ✅ NEGOCIACIÓN
  if (flags.isNegotiation) {
    base.negotationOutcomeId = vals.negotationOutcomeId;

    if (vals.negotationOutcomeId === STATE.OBS_CLIENT) {
      base.typeObsClientsId = vals.typeObsClientsId;
      base.reasonObsClients = vals.reasonObsClients;
      base.typeObsEconomic = vals.typeObsEconomic;
    } else {
      base.typeObsClientsId = undefined;
      base.typeObsEconomic = undefined;
      base.reasonObsClients = undefined;
    }
  } else {
    base.negotationOutcomeId = undefined;
    base.typeObsClientsId = undefined;
  }

  return base;
}

export function OpporChangeStateForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  stateOpporLabel,
  reasonRejectionLabel,
  quotationVerNoLabel,
  loadingDetail = false,
  pmConditionLabel,
}: Props) {
  const { canCreateOpporManager } = useCrmOpporPerms();

  const schema = useMemo(
    () => createSchemaState({ canCreateOpporManager }),
    [canCreateOpporManager],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    setError,
    clearErrors,
    watch,
    formState,
  } = useForm<FormStateValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: mapToFormStateValues(defaultValues),
  });

  const { errors, isValid, isSubmitting } = formState;

  const dvKey = String(
    (defaultValues as any)?.opporId ?? defaultValues?.linkToken ?? "",
  );
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!dvKey) return;
    if (formState.isDirty) return;

    if (lastKeyRef.current !== dvKey) {
      lastKeyRef.current = dvKey;
      reset(mapToFormStateValues(defaultValues));
    }
  }, [dvKey, reset, formState.isDirty]);
  const { data: viabilityLimit } = useViabilityLimit();
  const { data: statesOpportunityResp } = useStateOpportunityOptions();
  const { data: quotationVersionNoResp } = QuotationVersionNoOptions(
    1,
    defaultValues?.linkToken ?? "",
  );

  const { data: pmConditionOptions } = usePaymentConditionOptions();

  const items = statesOpportunityResp?.items ?? [];

  /** ✅ observa solo stateOpporId */
  const selectedState = useWatch({ control, name: "stateOpporId" });
  const flags = useMemo(
    () => computeFlags(selectedState, canCreateOpporManager),
    [selectedState, canCreateOpporManager],
  );

  const followupEnabled = watch("followupEnabled");
  const isFollowupOn = (followupEnabled ?? false) === true;
  const selected = Number(selectedState ?? 0);
  const originState = Number(defaultValues?.stateOpporId ?? 0);

  // ✅ SOLO pedimos Excel + "propuesta presentada" cuando entramos a PROPUESTA desde ANÁLISIS
  const isEnteringProposalFromAnalysis =
    originState === STATE.OPPORTUNITY && flags.isProposal;

  const isHiring = Number((defaultValues as any)?.isHiring ?? 0) === 1;
  const isReEvaluation =
    Number((defaultValues as any)?.isReEvaluation ?? 0) === 1;

  const actionOptions = useMemo(() => {
    const base = items
      .filter((x) => ACTION_STATES.includes(Number(x.value)))
      .map((x) => ({ value: x.value, label: x.label }));

    return ensureSelectedOption(base, selected, items);
  }, [items, selected]);

  /*const resultOptions = useMemo(() => {
    const base = items
      .filter((x) => RESULT_STATES.includes(Number(x.value)))
      .sort(
        (a, b) =>
          RESULT_STATES.indexOf(Number(a.value)) - RESULT_STATES.indexOf(Number(b.value)),
      )
      .map((x) => ({ value: x.value, label: x.label }));

    return ensureSelectedOption(base, selected, items);
  }, [items, selected]);*/

  const reEvaluationOptions = useMemo(() => {
    const base = items
      .filter((x) => RE_EVALUATION.includes(Number(x.value)))
      .map((x) => ({ value: x.value, label: x.label }));

    return ensureSelectedOption(base, RE_EVALUATION[0], items);
  }, [items]);

  const [uploadPctLocal, setUploadPctLocal] = useState(0);

  useEffect(() => {
    if (!isReEvaluation) return;

    setValue("stateOpporId", RE_EVALUATION[0], {
      shouldValidate: true,
      shouldDirty: true,
    });

    clearErrors(["stateOpporId"]);
  }, [isReEvaluation, setValue, clearErrors]);

  // ✅ Transiciones permitidas según origen (evita PROSPECTO -> PROPUESTA)
  const FLOW_TRANSITIONS: Record<number, number[]> = {
    [STATE.PROSPECT]: [
      STATE.ANALYSIS,
      STATE.LOST,
      STATE.DISCARDED,
      STATE.STANDBY,
    ],
    [STATE.ANALYSIS]: [STATE.PROPOSAL],
    [STATE.OPPORTUNITY]: [
      STATE.PROPOSAL,
      STATE.LOST,
      STATE.DISCARDED,
      STATE.STANDBY,
    ],
    [STATE.PROPOSAL]: [
      STATE.NEGOTATION,
      STATE.WON,
      STATE.LOST,
      STATE.DISCARDED,
      STATE.STANDBY,
    ],
    [STATE.NEGOTATION]: [STATE.PROPOSAL],
    [STATE.OBS]: [STATE.DISCARDED],
  };

  const stateOptions = useMemo(() => {
    if (isReEvaluation) return reEvaluationOptions;

    const allowed = FLOW_TRANSITIONS[originState];

    if (allowed?.length) {
      const mapById = new Map(
        items.map((x) => [Number(x.value), { value: x.value, label: x.label }]),
      );

      const ordered = allowed
        .map((id) => mapById.get(id))
        .filter(Boolean) as Array<{ value: number; label: string }>;

      const forcedSelected =
        originState === STATE.NEGOTATION ? STATE.PROPOSAL : selected;

      return ensureSelectedOption(ordered, forcedSelected, items);
    }

    return actionOptions;
  }, [
    isReEvaluation,
    reEvaluationOptions,
    originState,
    items,
    selected,
    actionOptions,
  ]);

  useEffect(() => {
    if (isReEvaluation) return;

    // Si estoy en NEGOCIACIÓN, el siguiente estado debe ser PROPUESTA sí o sí
    if (originState === STATE.NEGOTATION) {
      setValue("stateOpporId", STATE.PROPOSAL, {
        shouldValidate: true,
        shouldDirty: true,
      });
      clearErrors(["stateOpporId"]);
    }
  }, [originState, isReEvaluation, setValue, clearErrors]);

  const negotiationOptions = useMemo(() => {
    const mapById = new Map(
      items.map((x) => [Number(x.value), { value: x.value, label: x.label }]),
    );

    const ordered = NEGOTATION_STATES.map((id) => mapById.get(id)).filter(
      Boolean,
    ) as Array<{
      value: number;
      label: string;
    }>;

    const currentNeg = Number(defaultValues?.negotationOutcomeId ?? 0);
    return ensureSelectedOption(ordered, currentNeg, items);
  }, [items, defaultValues?.negotationOutcomeId]);

  const negotiationOutcomeId = useWatch({
    control,
    name: "negotationOutcomeId",
  });
  const typeObsClientId = useWatch({ control, name: "typeObsClientsId" });

  const isTypeObsClient =
    flags.isNegotiation &&
    Number(negotiationOutcomeId ?? 0) === STATE.OBS_CLIENT;

  const showReasonText = isTypeObsClient && Number(typeObsClientId ?? 0) === 1;
  const showReasonSelectAndText =
    isTypeObsClient && Number(typeObsClientId ?? 0) === 2;

  useEffect(() => {
    if (Number(negotiationOutcomeId ?? 0) !== STATE.OBS_CLIENT) {
      setValue("typeObsClientsId", undefined, { shouldValidate: true });
      clearErrors(["typeObsClientsId"]);
    }
  }, [negotiationOutcomeId, setValue, clearErrors]);

  const proposalPresentated = useWatch({
    control,
    name: "proposalPresentated",
  });

  const viabilityInputs = useWatch({
    control,
    name: [
      "requiresIsos",
      "authority",
      "budget",
      "need",
      "term",
      "companyExperience",
      "workerExperience",
      "staffExperience",
      "ability",
      "shedule",
      "brandAproach",
      "TechnicalChanges",
    ],
  });

  const viabilityValues = useMemo(() => {
    const [
      requiresIsos,
      authority,
      budget,
      need,
      term,
      companyExperience,
      workerExperience,
      staffExperience,
      ability,
      shedule,
      brandAproach,
      TechnicalChanges,
    ] = viabilityInputs ?? [];

    return {
      requiresIsos: isHiring ? requiresIsos : undefined,
      authority,
      budget,
      need,
      term,
      companyExperience,
      workerExperience,
      staffExperience,
      ability,
      shedule,
      brandAproach: isReEvaluation ? brandAproach : undefined,
      TechnicalChanges: isReEvaluation ? TechnicalChanges : undefined,
    } as Partial<FormStateValues>;
  }, [viabilityInputs, isHiring, isReEvaluation]);

  const viabilityCalc = useMemo(
    () => computeViabilityFrom(viabilityValues),
    [viabilityValues],
  );

  const hasViabilityData = useMemo(() => {
    const d = defaultValues;
    return (
      d?.authority != null ||
      d?.budget != null ||
      d?.need != null ||
      d?.term != null ||
      d?.companyExperience != null ||
      d?.workerExperience != null ||
      d?.staffExperience != null ||
      d?.ability != null ||
      d?.shedule != null ||
      d?.brandAproach != null ||
      d?.TechnicalChanges != null
    );
  }, [defaultValues]);

  useEffect(() => {
    if (!viabilityLimit) return;
    if (viabilityLimit.min != null) setValue("minScore", viabilityLimit.min);
    if (viabilityLimit.max != null) setValue("maxScore", viabilityLimit.max);
  }, [viabilityLimit, setValue]);

  useEffect(() => {
    if (flags.withViability) return;

    for (const f of VIABILITY_FIELDS) {
      setValue(f, undefined as any, { shouldValidate: true });
    }
    clearErrors([...VIABILITY_FIELDS]);
  }, [flags.withViability, setValue, clearErrors]);

  useEffect(() => {
    if (flags.isLosts) return;
    setValue("reasonRejectionId", undefined, { shouldValidate: true });
    setValue("reasonRejection", "", { shouldValidate: true });
  }, [flags.isLosts, setValue]);

  useEffect(() => {
    if (!flags.isNegotiation) {
      setValue("negotationOutcomeId", undefined, { shouldValidate: true });
      setValue("typeObsClientsId", undefined, { shouldValidate: true });
      setValue("typeObsEconomic", undefined, { shouldValidate: true });
      setValue("reasonObsClients", "", { shouldValidate: true });
      clearErrors([
        "negotationOutcomeId",
        "typeObsClientsId",
        "typeObsEconomic",
        "reasonObsClients",
      ]);
      return;
    }

    if (Number(negotiationOutcomeId ?? 0) !== STATE.OBS_CLIENT) {
      setValue("typeObsClientsId", undefined, { shouldValidate: true });
      setValue("typeObsEconomic", undefined, { shouldValidate: true });
      setValue("reasonObsClients", "", { shouldValidate: true });
      clearErrors(["typeObsClientsId", "typeObsEconomic", "reasonObsClients"]);
    }
  }, [flags.isNegotiation, negotiationOutcomeId, setValue, clearErrors]);

  useEffect(() => {
    if (Number(typeObsClientId ?? 0) !== 2) {
      setValue("typeObsEconomic", undefined, { shouldValidate: true });
      clearErrors(["typeObsEconomic"]);
    }
  }, [typeObsClientId, setValue, clearErrors]);

  useEffect(() => {
    if (!flags.withViability) return;

    setValue("compliance", viabilityCalc.compliance, { shouldValidate: true });
    setValue("partialCompliance", viabilityCalc.partialCompliance, {
      shouldValidate: true,
    });
    setValue("nonCompliance", viabilityCalc.nonCompliance, {
      shouldValidate: true,
    });
    setValue("viabilityScore", viabilityCalc.viabilityScore, {
      shouldValidate: true,
    });

    setValue("isHiring", defaultValues?.isHiring, { shouldValidate: true });
    setValue("isReEvaluation", defaultValues?.isReEvaluation, {
      shouldValidate: true,
    });

    if (viabilityLimit?.max != null) {
      setValue("maxScore", viabilityLimit.max, { shouldValidate: true });
    }
    if (viabilityLimit?.min != null) {
      setValue("minScore", viabilityLimit.min, { shouldValidate: true });
    }
  }, [
    flags.withViability,
    defaultValues,
    viabilityCalc,
    viabilityLimit,
    setValue,
  ]);

  const { data: reasonRejectionOpportunityResp } = useReasonRejectionOptions();
  const reasonRejectionOpportunityOptions = useMemo(
    () => reasonRejectionOpportunityResp?.items ?? [],
    [reasonRejectionOpportunityResp],
  );

  const excelFile = useWatch({ control, name: "excelFile" });
  useEffect(() => {
    if (flags.isLost && !isFollowupOn) {
      setValue("callDate", null, {
        shouldValidate: true,
        shouldDirty: true,
      });
      clearErrors(["callDate"]);
    }
  }, [flags.isLost, isFollowupOn, setValue, clearErrors]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(
        async (vals) => {
          const dto = buildUpdateDto(
            vals,
            defaultValues,
            flags,
            viabilityCalc,
            {
              isEnteringProposalFromAnalysis,
            },
          );

          // ✅ exigir excel SOLO cuando entra a propuesta desde análisis
          if (isEnteringProposalFromAnalysis && !vals.excelFile) {
            setError("excelFile", {
              type: "custom",
              message: "Debes subir el archivo de cotización.",
            });
            return;
          }

          clearErrors("excelFile");

          // ✅ upload SOLO cuando entra a propuesta desde análisis
          if (
            isEnteringProposalFromAnalysis &&
            vals.excelFile instanceof File
          ) {
            const rootFolderName = "OPORTUNIDADES";
            const year = String(new Date().getFullYear());
            const baseSegments: string[] = [year, rootFolderName];
            const folderKey = "PRESUPUESTAL/CLIENTES";

            try {
              const cleanName = safeFileName(vals.excelFile.name);

              const up = await uploadByArchiveType(
                vals.excelFile,
                vals.opporNumber,
                folderKey,
                {
                  strategy: "same",
                  baseSegments,
                  name: cleanName,
                  onProgress: (pct: number) => setUploadPctLocal(pct),
                },
              );

              dto.fileTitle = up.fileName;
              dto.fileUrl = up.url;
              dto.relativePath = up.relativePath;
              dto.archiveType = "CLIENTES";
            } catch (err) {
              const msg =
                err instanceof Error
                  ? err.message
                  : "Error al subir el archivo";

              toast.error(msg);
              return;
            }
          }

          onSubmit(dto);
        },
        (e) => console.warn("Errores del formulario:", e),
      )}
      className="space-y-5"
    >
      <div className="col-span-full lg:col-span-6 min-w-0">
        <RHFSearchSelect<FormStateValues>
          name="stateOpporId"
          label={stateOpporLabel ?? "Estado"}
          options={stateOptions}
          control={control}
          fallbackLabel={stateOpporLabel}
          placeholder="Seleccione estado…"
        />
      </div>

      {flags.withViability && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Evaluación de viabilidad y entregables
              </h3>
              <p className="text-xs text-slate-500">
                Define los entregables mínimos y registra la viabilidad de la
                oportunidad antes de enviarla a preventa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Viabilidad calculada
              </span>

              <span
                className={`
                  inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    !viabilityLimit
                      ? "bg-slate-200 text-slate-600"
                      : viabilityCalc.viabilityScore < (viabilityLimit.min ?? 0)
                        ? "bg-rose-100 text-rose-700"
                        : viabilityCalc.viabilityScore <
                            (viabilityLimit.max ?? 0)
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                  }
                `}
              >
                {viabilityCalc.viabilityScore}%
                {viabilityLimit && (
                  <span className="ml-1 text-[10px] font-normal">
                    (rango: {viabilityLimit.min}% - {viabilityLimit.max}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <article className="rounded-xl bg-white p-4 shadow-sm">
                <Controller
                  name="deliverables"
                  control={control}
                  render={({ field }) => (
                    <OpporDeliverablesSection
                      value={(field.value as DeliverableItemDto[]) ?? []}
                      onChange={field.onChange}
                      disabled={saving || loadingDetail}
                      errors={errors.deliverables as any}
                    />
                  )}
                />
                {errors.deliverables && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.deliverables.message as any}
                  </p>
                )}
              </article>

              {isHiring && (
                <article className="rounded-xl bg-white p-4 shadow-sm">
                  <Controller
                    name="deliverablesHiring"
                    control={control}
                    render={({ field }) => (
                      <HiringDeliverablesSection
                        value={(field.value as DeliverableItemDto[]) ?? []}
                        onChange={field.onChange}
                        disabled={saving || loadingDetail}
                        errors={errors.deliverablesHiring as any}
                      />
                    )}
                  />
                </article>
              )}
            </div>

            <article className="col-span-12 lg:col-span-8 rounded-xl bg-white p-4 shadow-sm">
              <ViabilitySection
                register={register}
                watch={watch}
                totalCompliance={viabilityCalc.compliance}
                totalPartial={viabilityCalc.partialCompliance}
                totalNoComp={viabilityCalc.nonCompliance}
                disabled={saving || loadingDetail || hasViabilityData}
                errors={errors}
                touchedFields={formState.touchedFields}
                submitCount={formState.submitCount}
              />
            </article>
          </div>
        </section>
      )}

      {flags.isObs && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Observaciones de preventa
              </h3>
              <p className="text-xs text-slate-500">
                Debes definir una fecha de compromiso para cada una. Al guardar,
                se generarán tareas automáticas en tu panel comercial para su
                seguimiento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 ">
            <Controller
              name="observations"
              control={control}
              render={({ field }) => (
                <ObsOpporSection
                  value={
                    (field.value as ObservationOpporItemDto[] | undefined) ?? []
                  }
                  onChange={field.onChange}
                  disabled={saving || loadingDetail || hasViabilityData}
                  errors={errors.observations as any}
                />
              )}
            />
          </div>
        </section>
      )}

      {/* ✅ PROPUESTA: SOLO si entras desde ANÁLISIS */}
      {isEnteringProposalFromAnalysis && (
        <div className="col-span-full lg:col-span-12 min-w-0 space-y-3">
          <div className="col-span-full lg:col-span-12 min-w-0">
            <RHFSearchSelect<FormStateValues>
              name="pmConditionId"
              label={pmConditionLabel ?? "Condición de pago"}
              options={pmConditionOptions?.items ?? []}
              control={control}
              fallbackLabel=""
              placeholder="Seleccione la condición de pago…"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">
              Propuesta presentada
            </label>

            <Controller
              name="proposalPresentated"
              control={control}
              render={({ field }) => (
                <select
                  className={`w-full rounded-xl border bg-white px-3 py-2 text-sm
                    ${errors.proposalPresentated ? "border-red-400" : "border-gray-200"}
                  `}
                  value={field.value === undefined ? "" : String(field.value)}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? undefined : v === "true");
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              )}
            />

            {errors.proposalPresentated?.message && (
              <p className="mt-1 text-xs text-red-500">
                {String(errors.proposalPresentated.message)}
              </p>
            )}
          </div>

          <div>
            <RHFFileUpload<FormStateValues>
              name="excelFile"
              control={control}
              label="Excel de cotización"
              accept=".xlsx,.xls"
              disabled={saving || loadingDetail}
              error={errors.excelFile?.message as string | undefined}
              helperText="Adjunta el Excel para generar la cotización automáticamente."
            />

            {saving && !!excelFile && (
              <div className="mt-3">
                <UploadProgress pct={uploadPctLocal} />
              </div>
            )}
          </div>

          {proposalPresentated === false && (
            <div>
              <RHFTextarea<FormStateValues>
                name="proposalComment"
                control={control}
                label="Descripción detallada"
                placeholder="Describe el motivo..."
                rows={2}
                maxLength={450}
                showCount
              />
            </div>
          )}
        </div>
      )}

      {flags.isWon && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="col-span-full lg:col-span-12 min-w-0">
            <RHFSearchSelect<FormStateValues>
              name="quotationVerId"
              label={quotationVerNoLabel ?? "Estado"}
              options={quotationVersionNoResp?.items ?? []}
              control={control}
              fallbackLabel=""
              placeholder="Seleccione la version ganadora…"
            />
          </div>

          <div className="col-span-full lg:col-span-12 min-w-0">
            <RHFTextarea<FormStateValues>
              name="wonComment"
              control={control}
              label="Descripción detallada"
              placeholder="Describe el avance..."
              rows={2}
              maxLength={450}
              showCount
            />
          </div>
        </div>
      )}

      {flags.isLosts && (
        <>
          <div className="col-span-full lg:col-span-6 min-w-0">
            <RHFSearchSelect<FormStateValues>
              name="reasonRejectionId"
              label={reasonRejectionLabel ?? "Motivo"}
              options={reasonRejectionOpportunityOptions}
              control={control}
              placeholder="Seleccione motivo…"
            />
          </div>

          <div className="col-span-full lg:col-span-12 min-w-0">
            <RHFTextarea<FormStateValues>
              name="reasonRejection"
              control={control}
              label="Descripción detallada"
              placeholder="Describe el motivo..."
              rows={2}
              maxLength={200}
              showCount
            />
          </div>
        </>
      )}

      {flags.isLost && (
        <>
          {isFollowupOn && (
            <div className="col-span-full lg:col-span-6 min-w-0">
              <RHFDate<FormStateValues>
                name={"callDate"}
                control={control}
                label="Fecha de convocatoria *"
              />
            </div>
          )}
          <div className="col-span-full lg:col-span-6 min-w-0">
            <Controller
              name="followupEnabled"
              control={control}
              defaultValue={false}
              render={({ field }) => {
                const checked = field.value === true;
                return (
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Se volvera a convocar?
                    </span>
                  </label>
                );
              }}
            />
          </div>
        </>
      )}

      {flags.isNegotiation && (
        <div className="col-span-full lg:col-span-6 min-w-0 space-y-3">
          <RHFSearchSelect<FormStateValues>
            name="negotationOutcomeId"
            label="Estado de negociación"
            options={negotiationOptions}
            control={control}
            placeholder="Seleccione estado…"
          />
          {errors.negotationOutcomeId?.message && (
            <p className="mt-1 text-xs text-red-500">
              {String(errors.negotationOutcomeId.message)}
            </p>
          )}

          {isTypeObsClient && (
            <div className="space-y-3">
              <label className="block mb-1 font-medium text-sm text-gray-700">
                Tipo de observación
              </label>

              <Controller
                name="typeObsClientsId"
                control={control}
                render={({ field }) => (
                  <select
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-sm ${
                      errors.typeObsClientsId
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                    value={field.value == null ? "" : String(field.value)}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? undefined : Number(v));
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {isHiring && <option value="1">Administrativa</option>}
                    <option value="2">Económica</option>
                  </select>
                )}
              />

              {errors.typeObsClientsId?.message && (
                <p className="mt-1 text-xs text-red-500">
                  {String(errors.typeObsClientsId.message)}
                </p>
              )}

              {showReasonSelectAndText && (
                <div>
                  <label className="block mb-1 font-medium text-sm text-gray-700">
                    Motivo (económica)
                  </label>

                  <Controller
                    name="typeObsEconomic"
                    control={control}
                    render={({ field }) => (
                      <select
                        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm ${
                          errors.typeObsEconomic
                            ? "border-red-400"
                            : "border-gray-200"
                        }`}
                        value={field.value == null ? "" : String(field.value)}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? undefined : Number(v));
                        }}
                      >
                        <option value="">Seleccionar</option>
                        <option value="1">Márgenes</option>
                        <option value="2">Precios</option>
                        <option value="3">Técnica</option>
                      </select>
                    )}
                  />
                </div>
              )}

              {(showReasonText || showReasonSelectAndText) && (
                <RHFTextarea<FormStateValues>
                  name="reasonObsClients"
                  control={control}
                  label="Detalle de observación"
                  placeholder="Describe el motivo..."
                  rows={2}
                  maxLength={450}
                  showCount
                />
              )}
            </div>
          )}
        </div>
      )}

      {showActions && (
        <div className="col-span-full flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={saving || isSubmitting || !isValid}
          >
            {saving || isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}

export function UploadProgress({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-600">
        {clamped < 100 ? `Subiendo Excel… ${clamped}%` : "Procesando Excel…"}
      </p>
    </div>
  );
}
