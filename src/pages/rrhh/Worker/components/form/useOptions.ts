import type { OptionItem } from "@/application";
import {
  makeUseOptionsDistrict,
  makeUseOptionsProvince,
  useAreaOption,
  useBankOptions,
  useDocumentTypeOptions,
  useOptionsDepartment,
} from "@/sharedKernel";
import { useJobTitleOptions } from "@/sharedKernel/hooks/rrhh/useJobTitleList";
import { useMemo } from "react";

export function useStaticOptions() {
  const { data: docTypeResp } = useDocumentTypeOptions();
  const { data: jobTitleResp } = useJobTitleOptions();
  const { data: areaResp } = useAreaOption();
  const { data: bankResp } = useBankOptions();

  return {
    docTypeOptions: (docTypeResp?.items ?? []) as OptionItem[],
    jobTitleOptions: (jobTitleResp?.items ?? []) as OptionItem[],
    areaOptions: (areaResp?.items ?? []) as OptionItem[],
    bankOptions: (bankResp?.items ?? []) as OptionItem[],
  };
}

export function useGeoHooks(
  departmentId?: number | null,
  provinceId?: number | null
) {
  const useDept = useOptionsDepartment();
  const useProv = useMemo(
    () => makeUseOptionsProvince(departmentId ?? null),
    [departmentId]
  );
  const useDist = useMemo(
    () => makeUseOptionsDistrict(departmentId ?? null, provinceId ?? null),
    [departmentId, provinceId]
  );
  return { useDept, useProv, useDist };
}
