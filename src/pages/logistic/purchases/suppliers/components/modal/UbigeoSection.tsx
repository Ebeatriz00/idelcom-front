import type { OptionItem } from "@/application";
import {
  makeUseOptionsDistrict,
  makeUseOptionsProvince,
  useOptionsDepartment,
} from "@/sharedKernel";
import { useMemo } from "react";
import type {
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { SearchSelectRHF } from "./from/SearchSelectRHF";
import type { SuppliersFormValues } from "./from/suppliers.schema";

export function UbigeoSection({
  control,
  watch,
  setValue,
  errors,
  initialDepartmentLabel,
  initialProvinceLabel,
  initialDistrictLabel,
}: {
  control: Control<SuppliersFormValues>;
  watch: UseFormWatch<SuppliersFormValues>;
  setValue: UseFormSetValue<SuppliersFormValues>;
  errors: FieldErrors<SuppliersFormValues>;
  initialDepartmentLabel?: string;
  initialProvinceLabel?: string;
  initialDistrictLabel?: string;
}) {
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

  const { data: deptResp } = useDept(1, "", 1000);
  const deptItems: OptionItem[] = deptResp?.items ?? [];

  const { data: provResp } = useProv(1, "", 1000);
  const provItems: OptionItem[] = provResp?.items ?? [];

  const { data: distResp } = useDist(1, "", 1000);
  const distItems: OptionItem[] = distResp?.items ?? [];

  return (
    <>
      <div className="min-w-0">
        <SearchSelectRHF<SuppliersFormValues>
          control={control}
          errors={errors}
          name="departmentId"
          labelName="departmentLabel"
          label="Departamento"
          items={deptItems}
          initialLabel={initialDepartmentLabel}
          watch={watch}
          setValue={setValue}
          useOptions={useDept}
          placeholder="Buscar departamento…"
          onAfterChange={() => {
            setValue("provinceId", 0, { shouldValidate: true });
            setValue("provinceLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
            setValue("districtId", 0, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
        />
      </div>
      <div className="min-w-0">
        <SearchSelectRHF<SuppliersFormValues>
          control={control}
          errors={errors}
          name="provinceId"
          labelName="provinceLabel"
          label="Provincia"
          items={provItems}
          initialLabel={initialProvinceLabel}
          watch={watch}
          setValue={setValue}
          useOptions={useProv}
          disabled={!departmentId}
          placeholder="Buscar provincia…"
          onAfterChange={() => {
            setValue("districtId", 0, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
        />
      </div>
      <div className="min-w-0">
        <SearchSelectRHF<SuppliersFormValues>
          control={control}
          errors={errors}
          name="districtId"
          labelName="districtLabel"
          label="Distrito"
          items={distItems}
          initialLabel={initialDistrictLabel}
          watch={watch}
          setValue={setValue}
          useOptions={useDist}
          disabled={!departmentId || !provinceId}
          placeholder="Buscar distrito…"
        />
      </div>
    </>
  );
}
