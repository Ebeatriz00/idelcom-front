import type { OptionItem } from "@/application";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { idToOption, type ClientsFormValues } from "./clients.schema";
import { RHFSearchSelect } from "./RHFSearchSelect";

export function UbigeoSection({
  control,
  watch,
  setValue,
  deptItems,
  provItems,
  distItems,
  useDept,
  useProv,
  useDist,
  departmentLabel,
  provinceLabel,
  districtLabel,
}: {
  control: Control<ClientsFormValues>;
  watch: UseFormWatch<ClientsFormValues>;
  setValue: UseFormSetValue<ClientsFormValues>;
  deptItems: OptionItem[];
  provItems: OptionItem[];
  distItems: OptionItem[];
  useDept: any;
  useProv: any;
  useDist: any;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
}) {
  const departmentId = watch("departmentId");
  const provinceId = watch("provinceId");
  const districtId = watch("districtId");

  return (
    <>
      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="departmentId"
          label="Departamento"
          useOptions={useDept}
          value={
            deptItems.find((o) => Number(o.value) === departmentId) ??
            idToOption(
              departmentId,
              watch("departmentLabel") || departmentLabel
            )
          }
          onChangeValue={(opt) => {
            setValue("departmentId", opt ? Number(opt.value) : null, {
              shouldValidate: true,
            });
            setValue("departmentLabel", opt?.label ?? "", {
              shouldValidate: false,
              shouldDirty: true,
            });

            setValue("provinceId", null, { shouldValidate: true });
            setValue("provinceLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });

            setValue("districtId", null, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
          placeholder="Buscar departamento…"
          pageSize={10}
          minSearchChars={0}
        />
      </div>

      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="provinceId"
          label="Provincia"
          useOptions={useProv}
          value={
            provItems.find((o) => Number(o.value) === provinceId) ??
            idToOption(provinceId, watch("provinceLabel") || provinceLabel)
          }
          onChangeValue={(opt) => {
            setValue("provinceId", opt ? Number(opt.value) : null, {
              shouldValidate: true,
            });
            setValue("provinceLabel", opt?.label ?? "", {
              shouldValidate: false,
              shouldDirty: true,
            });

            setValue("districtId", null, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
          disabled={!departmentId}
          placeholder="Buscar provincia…"
          pageSize={10}
          minSearchChars={0}
        />
      </div>

      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="districtId"
          label="Distrito"
          useOptions={useDist}
          value={
            distItems.find((o) => Number(o.value) === districtId) ??
            idToOption(districtId, watch("districtLabel") || districtLabel)
          }
          onChangeValue={(opt) => {
            setValue("districtId", opt ? Number(opt.value) : null, {
              shouldValidate: true,
            });
            setValue("districtLabel", opt?.label ?? "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
          disabled={!departmentId || !provinceId}
          placeholder="Buscar distrito…"
          pageSize={10}
          minSearchChars={0}
        />
      </div>
    </>
  );
}
