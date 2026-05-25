import type {
  DeliverableItemDto,
  HiringFileItemDto,
  OpportunitiesUpsertDto,
} from "@/application";
import {
  uploadByArchiveType,
  useBusinessLineOptions,
  useClientsOptions,
  useCurrencyOptions,
  useFlowTypeOptions,
  useNegotiationStagesOptions,
  useOpportunitiesOptions,
  usePaymentConditionOptions,
} from "@/sharedKernel";
import { useSalesWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";

import { attachHiringFilesApi } from "@/infrastructure";
import { useContactsSelects } from "@/sharedKernel/hooks/crm/contacts/useContacts";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCrmOpporPerms } from "../../hooks/oppor.perms";
import { RHFSearchSelect } from "../detail/modal/form/RHFSearchSelect";
import { OpporDeliverablesHiringSection } from "./deliverablesHiring/opporDeliverablesHiringSection";
import {
  OpporHiringFilesSection,
  type PendingHiringFile,
} from "./deliverablesHiring/opporHiringFilesSection";
import {
  probOptions,
  RHFDate,
  RHFDateTime,
  RHFNumber,
  RHFSelectNumber,
  RHFTextarea,
} from "./form/fields";
import { mapToFormValues } from "./form/mapToDefaults";
import { createSchema, type FormValues } from "./form/schema";
import { useAutoSetWorker } from "./form/useAutoSetWorker";

type Props = {
  defaultValues?: Partial<OpportunitiesUpsertDto>;
  onSubmit: (
    dto: OpportunitiesUpsertDto,
  ) => Promise<{ Id: number; opporNum: string }>;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  clientsLabel?: string;
  businessLineLabel?: string;
  workerLabel?: string;
  currencyLabel?: string;
  negotiationStagesLabel?: string;
  contactsLabel?: string;
  flowTypeLabel?: string;
  pmConditionLabel?: string;
  parentOpporLabel?: string;
  step?: 1 | 2;
  onStepChange?: (s: 1 | 2) => void;
};

export function OpportunityForm({
  defaultValues,
  onSubmit,
  formId,
  clientsLabel,
  businessLineLabel,
  workerLabel,
  currencyLabel,
  negotiationStagesLabel,
  contactsLabel,
  flowTypeLabel,
  pmConditionLabel,
  parentOpporLabel,
}: Props) {
  const { canUseSellerOption } = useCrmOpporPerms();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema(true)),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: mapToFormValues(defaultValues),
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  const [pendingHiringFiles, setPendingHiringFiles] = useState<
    PendingHiringFile[]
  >([]);

  // ---------------------------
  // SELECTS
  // ---------------------------
  const clientsQuery = useClientsOptions();
  const clientspeOptions = useSelectOptions(clientsQuery);
  const clientId = watch("clientsId");

  const typeOppor = watch("typeOppor");

  const parentOpporQuery = useOpportunitiesOptions(clientId);
  const parentOpporOptions = useSelectOptions(parentOpporQuery);

  // ⬇️ contactos dependen del cliente
  const contacstQuery = useContactsSelects(clientId);
  const contactsOptions = useSelectOptions(contacstQuery);

  const businessLineQuery = useBusinessLineOptions();
  const businessLineOptions = useSelectOptions(businessLineQuery);

  const workerSalesQuery = useSalesWorkerOptions();
  const workerSalesOptions = useSelectOptions(workerSalesQuery);

  const currencyQuery = useCurrencyOptions();
  const currencyOptions = useSelectOptions(currencyQuery);

  const negotiationStagesQuery = useNegotiationStagesOptions();
  const negotiationsStagesOption = useSelectOptions(negotiationStagesQuery);

  const pmConditionQuery = usePaymentConditionOptions();
  const pmConditionOptions = useSelectOptions(pmConditionQuery);

  const flowTypeQuery = useFlowTypeOptions();
  const flowTypeOptions = useSelectOptions(flowTypeQuery);

  const currentWorkerId = useAuth((s) => s.workerId);
  const currentRole = useAuth((s) => s.profile);
  const isGerente = currentRole === "GERENTE COMERCIAL";

  const isEdit = Boolean(
    (defaultValues as any)?.Id ?? (defaultValues as any)?.id,
  );
  const formWorkerId = watch("workerId");
  const workerSalesOptionsFixed = useMemo(() => {
    const exists = (workerSalesOptions ?? []).some(
      (o) => Number(o.value) === Number(currentWorkerId),
    );

    if (exists || !currentWorkerId) return workerSalesOptions;

    return [
      {
        value: Number(currentWorkerId),
        label: workerLabel ?? "Mi usuario",
      },
      ...(workerSalesOptions ?? []),
    ];
  }, [workerSalesOptions, currentWorkerId, workerLabel]);

  const clientsId = watch("clientsId");
  const selectedClient = useMemo(
    () =>
      (clientspeOptions ?? []).find(
        (o) => Number(o.value) === Number(clientsId),
      ),
    [clientspeOptions, clientsId],
  );

  const isPublicById =
    String((selectedClient as any)?.extraInfo ?? "").trim() === "1";

  useEffect(() => {
    if (!canUseSellerOption) return;
    if (!isGerente) return;
    if (!currentWorkerId) return;

    if (isEdit && formWorkerId) return;

    if (!formWorkerId) {
      setValue("workerId", Number(currentWorkerId), {
        shouldValidate: true,
        shouldDirty: true,
      });
      trigger(["workerId"]);
    }
  }, [
    canUseSellerOption,
    isGerente,
    currentWorkerId,
    isEdit,
    formWorkerId,
    setValue,
    trigger,
  ]);

  useAutoSetWorker<FormValues>({
    canUseSellerOption,
    workerId: currentWorkerId,
    setValue,
  });

  const followupEnabled = watch("followupEnabled");
  const followupEveryDays = watch("followupEveryDay");
  const isHiring = watch("isHiring");
  const dateRegister = watch("dateRegister");
  const dateFinish = watch("dateFinish");
  const negotiationStagesId = watch("negotiationStagesId");

  const isFollowupOn = (followupEnabled ?? false) === true;
  const isHiringOn = (isHiring ?? false) === true;

  const isApoyoComercial = Number(negotiationStagesId) === 1;

  const existingDeliverablesHiringCount = (
    defaultValues?.deliverablesHiring ?? []
  ).length;

  const hasHiringData = existingDeliverablesHiringCount > 0;

  const contactId = watch("contactsId");

  useEffect(() => {
    if (!clientId) {
      if (contactId) {
        setValue("contactsId", undefined as any, { shouldValidate: true });
        trigger(["contactsId"]);
      }
      return;
    }

    if (contacstQuery.isLoading || contacstQuery.isFetching) return;

    const opts = contactsOptions ?? [];

    const existsCurrent =
      !!contactId && opts.some((o) => Number(o.value) === Number(contactId));

    if (opts.length === 0) {
      if (contactId) {
        setValue("contactsId", undefined as any, { shouldValidate: true });
        trigger(["contactsId"]);
      }
      return;
    }

    if (contactId && !existsCurrent) {
      setValue("contactsId", undefined as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
      trigger(["contactsId"]);
      return;
    }

    if (opts.length === 1) {
      const only = opts[0];
      const nextVal = Number(only.value);

      if (Number(contactId ?? 0) !== nextVal) {
        setValue("contactsId", nextVal as any, {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["contactsId"]);
      }
      return;
    }
    if (opts.length > 1) {
      if (isEdit && contactId) return;
      return;
    }
  }, [
    clientId,
    contactId,
    isEdit,
    contacstQuery.isLoading,
    contacstQuery.isFetching,
    contactsOptions,
    setValue,
    trigger,
  ]);

  const contactsCount = contactsOptions?.length ?? 0;
  const contactsDisabled =
    !clientId ||
    contacstQuery.isFetching ||
    contacstQuery.isLoading ||
    contactsCount <= 1;

  const defaultTypeOppor = Number((defaultValues as any)?.typeOppor ?? 1);
  const isAdditionalEdit = isEdit && defaultTypeOppor === 2;

  // ---------------------------
  // OTHER EFFECTS
  // ---------------------------
  useEffect(() => {
    if (!isFollowupOn) {
      setValue("followupEveryDay", undefined, { shouldValidate: true });
      trigger(["followupEveryDay"]);
    }
  }, [isFollowupOn, setValue, trigger]);

  useEffect(() => {
    if (!isHiringOn) {
      setValue("isHiring", false, { shouldValidate: true, shouldDirty: true });
      setValue("deliverablesHiring", undefined, { shouldValidate: true });
      setValue("hiringFiles", undefined, { shouldValidate: true });
      setPendingHiringFiles([]);
      trigger(["isHiring", "deliverablesHiring", "hiringFiles"]);
      return;
    }

    if (!isHiringOn) {
      setValue("deliverablesHiring", undefined, { shouldValidate: true });
      setValue("hiringFiles", defaultValues?.hiringFiles, {
        shouldValidate: true,
      });
      setPendingHiringFiles([]);
      trigger(["deliverablesHiring", "hiringFiles"]);
    }
  }, [isPublicById, isHiringOn, setValue, trigger, defaultValues?.hiringFiles]);

  useEffect(() => {
    if (pendingHiringFiles.length > 0) clearErrors("hiringFiles");
  }, [pendingHiringFiles.length, clearErrors]);

  useEffect(() => {
    if (!isFollowupOn) return;
    trigger(["followupEveryDay", "dateRegister", "dateFinish"]);
  }, [isFollowupOn, followupEveryDays, dateRegister, dateFinish, trigger]);

  useEffect(() => {
    if (!isApoyoComercial) return;
    setValue("consultDate", undefined, { shouldValidate: true });
    setValue("quoDate", undefined, { shouldValidate: true });

    setValue("followupEnabled", false, { shouldValidate: true });
    setValue("followupEveryDay", undefined, { shouldValidate: true });

    trigger([
      "porcentProgressPro",
      "opporAmount",
      "dateFinish",
      "consultDate",
      "quoDate",
      "followupEnabled",
      "followupEveryDay",
    ]);
  }, [isApoyoComercial, setValue, trigger]);
  useEffect(() => {
    if (Number(typeOppor) !== 2) {
      setValue("parentOpporId", undefined as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
      trigger(["parentOpporId"]);
    }
  }, [typeOppor, setValue, trigger]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (values) => {
        const hiringOn = isHiringOn;
        const filesSnapshot = [...pendingHiringFiles];

        if (hiringOn && filesSnapshot.length === 0 && !hasHiringData) {
          setError("hiringFiles", {
            type: "custom",
            message: "Debes subir al menos un archivo de soporte.",
          });
          return;
        }
        clearErrors("hiringFiles");

        const created = await onSubmit({
          ...values,
          deliverablesHiring: hiringOn
            ? (values.deliverablesHiring as DeliverableItemDto[] | undefined)
            : undefined,
          hiringFiles: undefined,
          opporNumber: undefined as any,
        } as any);

        const Id = (created as any).Id ?? (created as any).id;
        const opporNum = (created as any).opporNum;

        if (!hiringOn) return;

        try {
          const rootFolderName = "OPORTUNIDADES";
          const year = String(new Date().getFullYear());
          const baseSegments: string[] = [year, rootFolderName];
          const folderKey = "CONTRATACIONES/CONSULTORIA";

          const hiringFilesUploaded: HiringFileItemDto[] = await Promise.all(
            filesSnapshot.map(async (pendingFile) => {
              const up = await uploadByArchiveType(
                pendingFile.file,
                opporNum,
                folderKey,
                { strategy: "same", baseSegments },
              );

              return {
                fileTitle: up.fileName,
                fileUrl: up.url,
                relativePath: up.relativePath,
                archiveType: pendingFile.destination || "CONSULTORIA",
              };
            }),
          );

          await attachHiringFilesApi({
            opporId: Id,
            files: hiringFilesUploaded,
          });

          setPendingHiringFiles([]);
        } catch (e) {
          setError("hiringFiles", {
            type: "custom",
            message: "Falló la subida o el registro en BD.",
          });
        }
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="col-span-full lg:col-span-12 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="col-span-full lg:col-span-12 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"negotiationStagesId"}
                label={
                  <span>
                    Etapa de negocio
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={negotiationsStagesOption}
                control={control}
                fallbackLabel={negotiationStagesLabel}
                placeholder="Seleccione negociación…"
              />
            </div>

            <div className="col-span-full lg:col-span-12 min-w-0">
              <RHFTextarea<FormValues>
                name="opporDesc"
                control={control}
                label={
                  <span>
                    Descripción
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                placeholder="Describe la oportunidad..."
                rows={2}
                maxLength={200}
                showCount
              />
            </div>

            <div className="col-span-full lg:col-span-7 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"clientsId"}
                label={
                  <span>
                    Cliente <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={clientspeOptions}
                control={control}
                fallbackLabel={clientsLabel}
                placeholder="Seleccione cliente…"
              />
            </div>
            {/* CONTACTOS */}
            <div className="col-span-full lg:col-span-5 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"contactsId"}
                label={<span>Contacto</span>}
                options={contactsOptions}
                control={control}
                fallbackLabel={contactsLabel}
                disabled={contactsDisabled}
                placeholder={
                  !clientId
                    ? "Primero seleccione cliente…"
                    : contacstQuery.isFetching
                      ? "Cargando contactos…"
                      : contactsCount === 0
                        ? "Sin contactos"
                        : contactsCount === 1
                          ? "Contacto seleccionado automáticamente"
                          : "Seleccione contacto…"
                }
              />
              {!!clientId && contactsCount === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Este cliente no tiene contactos registrados.
                </p>
              )}
            </div>

            {/* OPORTUNIDAD */}
            <div className="col-span-full lg:col-span-4 min-w-0">
              <RHFSelectNumber<FormValues>
                name="typeOppor"
                control={control}
                label={
                  <span>
                    Tipo de oportunidad{" "}
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={[
                  { value: 1, label: "Principal" },
                  { value: 2, label: "Adicional" },
                ]}
                disabled={isEdit}
              />
            </div>
            {Number(typeOppor) === 2 && (
              <div className="col-span-full lg:col-span-4 min-w-0">
                <RHFSearchSelect<FormValues>
                  name={"parentOpporId"}
                  label={
                    <span>
                      Oportunidad principal{" "}
                      <small className="text-xs text-rose-600">*</small>
                    </span>
                  }
                  options={parentOpporOptions}
                  control={control}
                  fallbackLabel={parentOpporLabel}
                  placeholder="Seleccione oportunidad principal…"
                  disabled={!clientId || isAdditionalEdit}
                />
              </div>
            )}

            <div className="col-span-full lg:col-span-4 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"businessLineId"}
                label={
                  <span>
                    Linea de Negocio{" "}
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={businessLineOptions}
                control={control}
                fallbackLabel={businessLineLabel}
                placeholder="Seleccione línea…"
              />
            </div>

            <div className="col-span-full lg:col-span-4 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"pmConditionId"}
                label={
                  <span>
                    Condición de pago{" "}
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={pmConditionOptions}
                control={control}
                fallbackLabel={pmConditionLabel}
                placeholder="Seleccione condición de pago…"
              />
            </div>
            <div className="col-span-full lg:col-span-6 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"flowTypeId"}
                label={
                  <span>
                    Tipo de atención{" "}
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={flowTypeOptions}
                control={control}
                fallbackLabel={flowTypeLabel}
                placeholder="Seleccione tipo de atención…"
              />
            </div>

            {canUseSellerOption ? (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFSearchSelect<FormValues>
                  name={"workerId"}
                  label={
                    <span>
                      Comercial
                      <small className="text-xs text-rose-600">*</small>
                    </span>
                  }
                  options={workerSalesOptionsFixed}
                  control={control}
                  fallbackLabel={workerLabel}
                  placeholder="Seleccione comercial…"
                />
              </div>
            ) : (
              <Controller
                name="workerId"
                control={control}
                render={({ field }) => (
                  <input
                    type="hidden"
                    {...field}
                    value={defaultValues?.workerId ?? ""}
                  />
                )}
              />
            )}

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFSelectNumber<FormValues>
                  name="porcentProgressPro"
                  control={control}
                  label={
                    <span>
                      Probabilidad
                      <small className="text-xs text-rose-600">*</small>
                    </span>
                  }
                  options={probOptions}
                />
              </div>
            )}

            <div className="col-span-full lg:col-span-6 min-w-0">
              <RHFSearchSelect<FormValues>
                name={"currencyId"}
                label={
                  <span>
                    Moneda <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                options={currencyOptions}
                control={control}
                fallbackLabel={currencyLabel}
                placeholder="Seleccione moneda…"
              />
            </div>

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFNumber<FormValues>
                  name={"opporAmount"}
                  control={control}
                  label={
                    <span>
                      Presupuesto
                      <small className="text-xs text-rose-600">*</small>
                    </span>
                  }
                  step={0.01}
                  min={0}
                />
              </div>
            )}

            <div className="col-span-full lg:col-span-6 min-w-0">
              <RHFDate<FormValues>
                name={"dateRegister"}
                control={control}
                label={
                  <span>
                    Fecha de Registro{" "}
                    <small className="text-xs text-rose-600">*</small>
                  </span>
                }
                onAfterChange={() => trigger(["dateRegister", "dateFinish"])}
              />
            </div>

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFDateTime
                  name="quoDate"
                  control={control}
                  label="Fecha de Cotización"
                  inputClassName="text-sm"
                />
              </div>
            )}

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFDateTime
                  name="consultDate"
                  control={control}
                  label="Fecha de Consulta"
                  inputClassName="text-sm"
                />
              </div>
            )}

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFDate<FormValues>
                  name={"dateFinish"}
                  control={control}
                  label={
                    <span>
                      Fecha Proyectada de  Cierre{" "}
                      <small className="text-xs text-rose-600">*</small>
                    </span>
                  }
                  onAfterChange={() => trigger(["dateRegister", "dateFinish"])}
                />
              </div>
            )}

            {!isApoyoComercial && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <p className="mt-1 text-xs text-gray-500">
                  Se calcula automáticamente desde la fecha de registro.
                </p>
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
                          Activar recordatorio
                        </span>
                      </label>
                    );
                  }}
                />
              </div>
            )}

            {!isApoyoComercial && isFollowupOn && (
              <div className="col-span-full lg:col-span-6 min-w-0">
                <RHFNumber<FormValues>
                  name="followupEveryDay"
                  control={control}
                  label="Recordar cada (días)"
                  min={1}
                  step={1}
                />
              </div>
            )}

            <div className="col-span-full lg:col-span-6 min-w-0">
              <p className="mt-1 text-xs text-gray-500">
                ¿Desea consultoría de contrataciones?
              </p>
              <Controller
                name="isHiring"
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
                        disabled={hasHiringData}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Consultoría contrataciones
                      </span>
                    </label>
                  );
                }}
              />
            </div>

            {isHiring && (
              <div className="col-span-full lg:col-span-12 min-w-0">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <article className="col-span-full lg:col-span-6 rounded-xl bg-white p-4 shadow-sm">
                    <Controller
                      name="deliverablesHiring"
                      control={control}
                      render={({ field }) => (
                        <OpporDeliverablesHiringSection
                          value={
                            (field.value as DeliverableItemDto[] | undefined) ??
                            []
                          }
                          onChange={field.onChange}
                          errors={errors.deliverablesHiring as any}
                          disabled={hasHiringData}
                          hideSelect={hasHiringData}
                        />
                      )}
                    />
                    {errors.deliverablesHiring && (
                      <p className="mt-2 text-xs text-red-500">
                        {errors.deliverablesHiring.message}
                      </p>
                    )}
                  </article>

                  <article className="col-span-full lg:col-span-6 rounded-xl bg-white p-4 shadow-sm">
                    <OpporHiringFilesSection
                      files={pendingHiringFiles}
                      onChange={setPendingHiringFiles}
                      defaultDestination="CONSULTORIA"
                      showDestinationSelect={false}
                      error={errors.hiringFiles as any}
                      existingFiles={(defaultValues?.hiringFiles ?? []).map(
                        (f) => ({
                          fileTitle: f.fileTitle ?? "Archivo",
                          fileUrl: f.fileUrl,
                        }),
                      )}
                    />
                  </article>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
