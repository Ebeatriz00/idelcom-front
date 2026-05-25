import type { ClientsUpsertDto, OptionItem } from "@/application";
import {
  makeUseOptionsDistrict,
  makeUseOptionsProvince,
  useDocumentTypeOptions,
  useLeadsSourcesOptions,
  useLeadsStatusOptions,
  useOptionsDepartment,
  useProcessTypeOptions,
  useQualificationsOptions,
  useSectorOptions,
} from "@/sharedKernel";
import { useSalesWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { makeLocalUseOptions } from "@/sharedKernel/hooks/SelectOptions/makeLocalUseOptions";
import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useCrmAccountsPerms } from "../../../hooks/permissions/accounts.perms";
import {
  clientsSchema,
  mapToFormValues,
  type ClientsFormValues,
} from "./clients.schema";

export function useClientsForm(params: {
  defaultValues?: Partial<ClientsUpsertDto>;
}) {
  const { defaultValues } = params;

  const form = useForm<ClientsFormValues>({
    resolver: zodResolver(clientsSchema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues),
  });

  const { reset, watch, setValue } = form;

  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  // ===== Options (local useOptions)
  const { data: docTypeResp } = useDocumentTypeOptions();
  const docTypeOptions = docTypeResp?.items ?? [];
  const useDocType = useMemo(
    () => makeLocalUseOptions(docTypeOptions),
    [docTypeOptions]
  );

  const { data: workerSalesResp } = useSalesWorkerOptions();
  const workerSalesOptions = workerSalesResp?.items ?? [];
  const useWorkerSales = useMemo(
    () => makeLocalUseOptions(workerSalesOptions),
    [workerSalesOptions]
  );

  const { data: processTypeResp } = useProcessTypeOptions();
  const processTypeOptions = processTypeResp?.items ?? [];
  const useProcessType = useMemo(
    () => makeLocalUseOptions(processTypeOptions),
    [processTypeOptions]
  );

  const { data: sectorResp } = useSectorOptions();
  const sectorOptions = sectorResp?.items ?? [];
  const useSector = useMemo(
    () => makeLocalUseOptions(sectorOptions),
    [sectorOptions]
  );

  const { data: leadsSourcesResp } = useLeadsSourcesOptions();
  const leadsSourcesOptions = leadsSourcesResp?.items ?? [];
  const useLeadSources = useMemo(
    () => makeLocalUseOptions(leadsSourcesOptions),
    [leadsSourcesOptions]
  );

  const { data: leadsQualificationResp } = useQualificationsOptions();
  const leadsQualificationOptions = leadsQualificationResp?.items ?? [];
  const useLeadQualification = useMemo(
    () => makeLocalUseOptions(leadsQualificationOptions),
    [leadsQualificationOptions]
  );

  const { data: leadsStatusResp } = useLeadsStatusOptions();
  const leadsStatusOptions = leadsStatusResp?.items ?? [];
  const useLeadStatus = useMemo(
    () => makeLocalUseOptions(leadsStatusOptions),
    [leadsStatusOptions]
  );

  // ===== Ubigeo options
  const useDept = useOptionsDepartment();
  const departmentId = watch("departmentId");
  const provinceId = watch("provinceId");

  const useProv = useMemo(
    () => makeUseOptionsProvince(departmentId ?? null),
    [departmentId]
  );
  const useDist = useMemo(
    () => makeUseOptionsDistrict(departmentId ?? null, provinceId ?? null),
    [departmentId, provinceId]
  );

  const deptResp = useDept(1, "", 1000);
  const deptItems: OptionItem[] = deptResp?.data?.items ?? [];

  const provResp = useProv(1, "", 1000);
  const provItems: OptionItem[] = provResp?.data?.items ?? [];

  const distResp = useDist(1, "", 1000);
  const distItems: OptionItem[] = distResp?.data?.items ?? [];

  // Autocompletar labels si vienen ids pero no label
  useEffect(() => {
    const depId = watch("departmentId");
    const depLabel = watch("departmentLabel");
    if (depId != null && !depLabel) {
      const match = deptItems.find((o) => Number(o.value) === depId);
      if (match)
        setValue("departmentLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [deptItems, watch, setValue]);

  useEffect(() => {
    const provId = watch("provinceId");
    const provLabel = watch("provinceLabel");
    if (provId != null && !provLabel) {
      const match = provItems.find((o) => Number(o.value) === provId);
      if (match)
        setValue("provinceLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [provItems, watch, setValue]);

  useEffect(() => {
    const distId = watch("districtId");
    const distLabel = watch("districtLabel");
    if (distId != null && !distLabel) {
      const match = distItems.find((o) => Number(o.value) === distId);
      if (match)
        setValue("districtLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [distItems, watch, setValue]);

  // ===== Permisos vendedor
  const { canUseSellerOption } = useCrmAccountsPerms();
  const currentWorkerId = useAuth((s) => s.workerId);

  useEffect(() => {
    if (!canUseSellerOption && currentWorkerId != null) {
      setValue("workerId", Number(currentWorkerId), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, currentWorkerId, setValue]);

  return {
    form,
    perms: { canUseSellerOption, currentWorkerId },
    options: {
      docTypeOptions,
      workerSalesOptions,
      processTypeOptions,
      sectorOptions,
      leadsSourcesOptions,
      leadsQualificationOptions,
      leadsStatusOptions,
      deptItems,
      provItems,
      distItems,
    },
    useOptionsHooks: {
      useDocType,
      useWorkerSales,
      useProcessType,
      useSector,
      useLeadSources,
      useLeadQualification,
      useLeadStatus,
      useDept,
      useProv,
      useDist,
    },
  };
}
