import { useEffect } from "react";
import type { Control } from "react-hook-form";
import type { WorkerFormValues } from "./schema";
import { useGeoHooks } from "./useOptions";

import type { OptionItem } from "@/application";
import { RHFSearchSelect } from "./fields/RHFSearchSelect";

export function AddressCascade({
  control,
  watch,
  setValue,
  deptItems,
  provItems,
  distItems,
  labels,
}: {
  control: Control<WorkerFormValues>;
  watch: any;
  setValue: any;
  deptItems: OptionItem[];
  provItems: OptionItem[];
  distItems: OptionItem[];
  labels?: { department?: string; province?: string; district?: string };
}) {
  const departmentId = watch("departmentId");
  const provinceId = watch("provinceId");
  const { useDept, useProv, useDist } = useGeoHooks(departmentId, provinceId);

  useEffect(() => {
    const id = watch("departmentId");
    const label = watch("departmentLabel");
    if (id != null && !label) {
      const m = deptItems.find((o) => Number(o.value) === id);
      if (m)
        setValue("departmentLabel", m.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [deptItems, watch("departmentId"), watch("departmentLabel"), setValue]);

  useEffect(() => {
    const id = watch("provinceId");
    const label = watch("provinceLabel");
    if (id != null && !label) {
      const m = provItems.find((o) => Number(o.value) === id);
      if (m)
        setValue("provinceLabel", m.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [provItems, watch("provinceId"), watch("provinceLabel"), setValue]);

  useEffect(() => {
    const id = watch("districtId");
    const label = watch("districtLabel");
    if (id != null && !label) {
      const m = distItems.find((o) => Number(o.value) === id);
      if (m)
        setValue("districtLabel", m.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
    }
  }, [distItems, watch("districtId"), watch("districtLabel"), setValue]);

  return (
    <>
      <div className="col-span-full lg:col-span-6 min-w-0">
        <RHFSearchSelect
          name="departmentId"
          control={control}
          label="Departamento"
          useOptions={useDept}
          items={deptItems}
          valueLabel={labels?.department ?? watch("departmentLabel")}
          onChangeId={(id) => {
            setValue(
              "departmentLabel",
              id
                ? deptItems.find((o) => Number(o.value) === id)?.label ?? ""
                : "",
              { shouldValidate: false, shouldDirty: true }
            );
            setValue("provinceId", undefined, { shouldValidate: true });
            setValue("provinceLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
            setValue("districtId", undefined, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
          placeholder="Buscar departamento…"
        />
      </div>

      <div className="col-span-full lg:col-span-6 min-w-0">
        <RHFSearchSelect
          name="provinceId"
          control={control}
          label="Provincia"
          useOptions={useProv}
          items={provItems}
          valueLabel={labels?.province ?? watch("provinceLabel")}
          disabled={!watch("departmentId")}
          onChangeId={(id) => {
            setValue(
              "provinceLabel",
              id
                ? provItems.find((o) => Number(o.value) === id)?.label ?? ""
                : "",
              { shouldValidate: false, shouldDirty: true }
            );
            setValue("districtId", undefined, { shouldValidate: true });
            setValue("districtLabel", "", {
              shouldValidate: false,
              shouldDirty: true,
            });
          }}
          placeholder="Buscar provincia…"
        />
      </div>

      <div className="col-span-full lg:col-span-6 min-w-0">
        <RHFSearchSelect
          name="districtId"
          control={control}
          label="Distrito"
          useOptions={useDist}
          items={distItems}
          valueLabel={labels?.district ?? watch("districtLabel")}
          disabled={!watch("departmentId") || !watch("provinceId")}
          onChangeId={(id) => {
            setValue(
              "districtLabel",
              id
                ? distItems.find((o) => Number(o.value) === id)?.label ?? ""
                : "",
              { shouldValidate: false, shouldDirty: true }
            );
          }}
          placeholder="Buscar distrito…"
        />
      </div>
    </>
  );
}
