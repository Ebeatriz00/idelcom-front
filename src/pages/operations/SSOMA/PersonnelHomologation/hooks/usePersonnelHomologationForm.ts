import type { OptionItem } from "@/application";
import {
  useByPersonnelHomologationList,
  useMedicalAptitudeOptions,
} from "@/sharedKernel";
import { useRequirementOptions as useOperationOptions } from "@/sharedKernel/hooks/operations/SSOMA/SsomaHomologation/personnelHomologation/usePersonnelHomologation";
import { useRequirementOptions } from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { mapRequirementToDocument } from "../utils/helper";
import { mapToFormValues } from "../utils/personnelHomologation.mapToFormValues";
import {
  createSchema,
  type PersonnelHomologationFormValues,
} from "../utils/personnelHomologation.schema";
import type { PropsForm } from "../utils/TypesPersonnel";

export function usePersonnelHomologationForm({
  defaultValues,
  onSubmit,
  workerId: fallbackWorkerId,
}: Pick<PropsForm, "defaultValues" | "onSubmit" | "workerId">) {
  const initialValues = useMemo(
    () => mapToFormValues(defaultValues),
    [defaultValues],
  );

  const form = useForm<PersonnelHomologationFormValues>({
    resolver: zodResolver(createSchema()),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: initialValues,
  });

  const { control, setValue, watch, reset } = form;

  const fieldArray = useFieldArray({
    control,
    name: "documents",
  });

  const { replace } = fieldArray;

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const homologationScopeId = watch("homologationPersonnel.homologationScopeId");
  const workerId = watch("homologationPersonnel.workerId");
  const operationsId = watch("homologationPersonnel.operationsId");
  const validFrom = watch("homologationPersonnel.validFrom");
  const documents = watch("documents") || [];

  const effectiveWorkerId = Number(workerId || 0);
  const effectiveOperationsId = Number(operationsId || 0);

  const isOperationScope = Number(homologationScopeId) === 2;

  // El endpoint debe llamarse si es alcance de operaciones y tenemos ambos IDs
  const shouldLoadByWorkerRequirements =
    isOperationScope &&
    effectiveOperationsId > 0 &&
    effectiveWorkerId > 0;

  useEffect(() => {
    if (effectiveWorkerId > 0 || !fallbackWorkerId) return;

    setValue("homologationPersonnel.workerId", Number(fallbackWorkerId), {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [effectiveWorkerId, fallbackWorkerId, setValue]);

  // --- QUERIES ---
  const byWorkerQuery = useByPersonnelHomologationList(
    1,
    100,
    "",
    effectiveOperationsId,
    effectiveWorkerId,
    { enabled: shouldLoadByWorkerRequirements },
  );

  const operationOptionsQuery = useOperationOptions(1, 100, "", {
    enabled: isOperationScope,
  });

  const requirementPreviewQuery = useRequirementOptions(
    Number(homologationScopeId ?? 0),
    1,
    100,
    "",
    { enabled: Boolean(homologationScopeId) },
  );

  const medicalAptitudeQuery = useMedicalAptitudeOptions(1, 100, "");

  // --- MEMOS & STATE ---
  const [previousScopeId, setPreviousScopeId] = useState<number | undefined>(
    initialValues.homologationPersonnel?.homologationScopeId,
  );
  const [previousOperationsId, setPreviousOperationsId] = useState<
    number | undefined
  >(initialValues.homologationPersonnel?.operationsId);

  const [, setIsSyncing] = useState(false);

  const requirementOptions = useMemo<OptionItem[]>(() => {
    return (requirementPreviewQuery.data?.items ?? []).map((item) => ({
      value: Number(item.value),
      label: item.label,
    }));
  }, [requirementPreviewQuery.data?.items]);

  const operationRequirementOptions = useMemo<OptionItem[]>(() => {
    const unique = new Map<number, OptionItem>();
    for (const item of byWorkerQuery.data?.items ?? []) {
      const rId = Number(item.requirementId);
      if (!rId || unique.has(rId)) continue;
      unique.set(rId, { value: rId, label: item.requirementName });
    }
    return [...unique.values()];
  }, [byWorkerQuery.data?.items]);

  const selectedOperation = (operationOptionsQuery.data?.items ?? []).find(
    (opt) => Number(opt.value) === Number(operationsId),
  );

  const readyDocs =
    documents?.filter(
      (doc) =>
        Boolean(doc?.requirementId) &&
        Boolean(doc?.fileName?.trim()) &&
        Boolean(doc?.filePath?.trim()) &&
        Boolean(doc?.localUploadToken),
    ).length ?? 0;
  const completedDocs =
    documents?.filter(
      (doc) =>
        Boolean(doc?.requirementId) &&
        Boolean(doc?.fileName?.trim()) &&
        Boolean(doc?.filePath?.trim()) &&
        !doc?.localUploadToken,
    ).length ?? 0;

  const hasUploadedDocuments = (documents ?? []).some(
    (doc) => doc.fileName?.trim() && doc.filePath?.trim(),
  );

  const hasCamoInDocuments = useMemo(
    () => (documents ?? []).some((doc) => Number(doc.requirementId) === 12),
    [documents],
  );

  const medicalAptitudeSummary = useMemo(() => {
    if (!isOperationScope) return null;
    if (!hasCamoInDocuments) return "Pendiente de seleccionar CAMO";
    return `CARGADO (según CAMO)`;
  }, [isOperationScope, hasCamoInDocuments]);

  const isHeaderReadyForDocuments = useMemo(() => {
    const hasScope = Number(homologationScopeId) > 0;
    const hasValidFrom = Boolean(String(validFrom ?? "").trim());

    if (!hasScope || !hasValidFrom) return false;

    if (isOperationScope) {
      const hasOperation = Number(effectiveOperationsId) > 0;
      if (!hasOperation) return false;
    }

    return true;
  }, [
    effectiveOperationsId,
    homologationScopeId,
    isOperationScope,
    validFrom,
  ]);

  const canAddDocuments = isHeaderReadyForDocuments;

  // --- EFFECTS ---

  // Limpieza de estado al cambiar Scope o Operación
  useEffect(() => {
    if (homologationScopeId && homologationScopeId !== previousScopeId) {
      setPreviousScopeId(homologationScopeId);
      setPreviousOperationsId(operationsId);
      replace([]);
      setIsSyncing(false);
      if (Number(homologationScopeId) === 1) {
        setValue("homologationPersonnel.operationsId", undefined, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    if (isOperationScope && operationsId !== previousOperationsId) {
      setPreviousOperationsId(operationsId);
      replace([]); // Siempre limpiar para forzar recarga de requisitos
      setIsSyncing(false);
    }
  }, [
    homologationScopeId,
    previousScopeId,
    operationsId,
    previousOperationsId,
    isOperationScope,
    replace,
    setValue,
  ]);

  // Carga automática de requisitos por trabajador (Scope 2)
  useEffect(() => {
    if (!shouldLoadByWorkerRequirements || !byWorkerQuery.data?.items) return;

    const filteredItems = byWorkerQuery.data.items.map(
      mapRequirementToDocument,
    );

    // Solo reemplazamos si no hay documentos o si estamos cambiando de operación
    if (documents.length === 0) {
      replace(filteredItems);
    }
  }, [
    byWorkerQuery.data?.items,
    replace,
    shouldLoadByWorkerRequirements,
    documents.length
  ]);

  // Resetear el estado de sincronización si cambian los IDs clave
  useEffect(() => {
     setIsSyncing(false);
  }, [effectiveOperationsId, effectiveWorkerId]);

  const useRequirementSearchOptions = useMemo(
    () =>
      (page: number, search: string, pageSize: number, opts?: any) =>
        useRequirementOptions(
          Number(homologationScopeId ?? 0),
          page,
          pageSize,
          search,
          opts,
        ),
    [homologationScopeId],
  );

  return {
    form,
    fieldArray,
    state: {
      homologationScopeId,
      isOperationScope,
      ssomaApproved: watch("homologationPersonnel.ssomaApproved"),
      adminApproved: watch("homologationPersonnel.adminApproved"),
      completedDocs,
      readyDocs,
      hasUploadedDocuments,
      isHeaderReadyForDocuments,
      canAddDocuments,
      medicalAptitudeSummary,
      operationLabel: selectedOperation?.label,
      shouldLoadByWorkerRequirements,
      workerId: effectiveWorkerId,
      showMedicalAptitude: isOperationScope && hasCamoInDocuments,
    },
    queries: {
      operationOptions: operationOptionsQuery.data?.items ?? [],
      operationOptionsLoading: operationOptionsQuery.isFetching,
      byWorkerLoading: byWorkerQuery.isFetching,
      operationsRequirementsByWorker: byWorkerQuery.data?.items ?? [],
      requirementOptions,
      operationRequirementOptions,
      medicalAptitudeOptions: medicalAptitudeQuery.data?.items ?? [],
    },
    methods: {
      handleSubmit: form.handleSubmit((values) => {
        const dto: any = {
          homologationPersonnel: {
            ...values.homologationPersonnel,
            medicalAptitudeId: Number(values.homologationPersonnel.medicalAptitudeId ?? 0),
          },
          documents: values.documents.map((doc) => ({
            ...doc,
            expirationDate: doc.expirationDate ?? "",
            reviewDate: doc.reviewDate ?? "",
            observation: doc.observation ?? "",
          })),
        };
        onSubmit(dto);
      }),
      useRequirementSearchOptions,
    },
  };
}
