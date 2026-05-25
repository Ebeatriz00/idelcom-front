import type { OptionItem, WarehousesUpsertDto } from "@/application";
import { SearchSelect } from "@/layouts";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import {
  makeUseOptionsDistrict,
  makeUseOptionsProvince,
  useOptionsDepartment,
} from "@/sharedKernel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  idToOption,
  warehouseSchema,
  type WarehouseFormValues,
} from "../../utils/warehouse.schema";
import type { PropsForm } from "../../utils/warehouse.type";

export function WarehousesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  departmentLabel,
  provinceLabel,
  districtLabel,
}: PropsForm) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    mode: "onChange",
    defaultValues: {
      warehousesId: defaultValues?.warehousesId ?? undefined,
      description: defaultValues?.description ?? "",
      address: defaultValues?.address ?? "",
      departmentId: defaultValues?.departmentId,
      provinceId: defaultValues?.provinceId,
      districtId: defaultValues?.districtId,
      departmentLabel: defaultValues?.departmentLabel ?? departmentLabel ?? "",
      provinceLabel: defaultValues?.provinceLabel ?? provinceLabel ?? "",
      districtLabel: defaultValues?.districtLabel ?? districtLabel ?? "",
    },
  });

  useEffect(() => {
    reset({
      warehousesId: defaultValues?.warehousesId ?? undefined,
      description: defaultValues?.description ?? "",
      address: defaultValues?.address ?? "",
      departmentId: defaultValues?.departmentId,
      provinceId: defaultValues?.provinceId,
      districtId: defaultValues?.districtId,
      departmentLabel: defaultValues?.departmentLabel ?? departmentLabel ?? "",
      provinceLabel: defaultValues?.provinceLabel ?? provinceLabel ?? "",
      districtLabel: defaultValues?.districtLabel ?? districtLabel ?? "",
    });
  }, [defaultValues, reset, departmentLabel, provinceLabel, districtLabel]);

  const useDept = useOptionsDepartment();

  const departmentId = watch("departmentId");
  const provinceId = watch("provinceId");

  const useProv = useMemo(
    () => makeUseOptionsProvince(departmentId ?? null),
    [departmentId],
  );
  const useDist = useMemo(
    () => makeUseOptionsDistrict(departmentId ?? null, provinceId ?? null),
    [departmentId, provinceId],
  );

  const deptResp = useDept(1, "", 1000);
  const deptItems: OptionItem[] = deptResp?.data?.items ?? [];

  const provResp = useProv(1, "", 1000);
  const provItems: OptionItem[] = provResp?.data?.items ?? [];

  const distResp = useDist(1, "", 1000);
  const distItems: OptionItem[] = distResp?.data?.items ?? [];

  useEffect(() => {
    const depId = watch("departmentId");
    const depLabel = watch("departmentLabel");
    if (depId != null && !depLabel) {
      const match = deptItems.find((o) => Number(o.value) === depId);
      if (match) {
        setValue("departmentLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [deptItems, watch, setValue]);

  useEffect(() => {
    const provId = watch("provinceId");
    const provLabel = watch("provinceLabel");
    if (provId != null && !provLabel) {
      const match = provItems.find((o) => Number(o.value) === provId);
      if (match) {
        setValue("provinceLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [provItems, watch, setValue]);

  useEffect(() => {
    const distId = watch("districtId");
    const distLabel = watch("districtLabel");
    if (distId != null && !distLabel) {
      const match = distItems.find((o) => Number(o.value) === distId);
      if (match) {
        setValue("districtLabel", match.label, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [distItems, watch, setValue]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        const dto: WarehousesUpsertDto = {
          warehousesId: values.warehousesId,
          description: values.description.trim(),
          address: values.address.trim(),
          departmentId: values.departmentId!,
          provinceId: values.provinceId!,
          districtId: values.districtId!,
        };
        onSubmit(dto);
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <UpperInput
                  id="description"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Ej: ALMACÉN PRINCIPAL"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                />
                {fieldState.error && (
                  <p className="text-xs text-rose-600">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Departamento
          </label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={useDept}
                value={
                  deptItems.find((o) => Number(o.value) === value) ??
                  idToOption(value, departmentLabel ?? watch("departmentLabel"))
                }
                onChange={(opt) => {
                  onChange(opt ? Number(opt.value) : undefined);
                  setValue("departmentLabel", opt?.label ?? "", {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
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
                pageSize={10}
                minSearchChars={0}
              />
            )}
          />
          {errors.departmentId && (
            <p className="text-xs text-rose-600">
              {errors.departmentId.message}
            </p>
          )}
        </div>

        {}
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Provincia
          </label>
          <Controller
            name="provinceId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={useProv}
                value={
                  provItems.find((o) => Number(o.value) === value) ??
                  idToOption(value, provinceLabel ?? watch("provinceLabel"))
                }
                onChange={(opt) => {
                  onChange(opt ? Number(opt.value) : undefined);
                  setValue("provinceLabel", opt?.label ?? "", {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
                  setValue("districtId", undefined, { shouldValidate: true });
                  setValue("districtLabel", "", {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
                }}
                disabled={!watch("departmentId")}
                placeholder="Buscar provincia…"
                pageSize={10}
                minSearchChars={0}
              />
            )}
          />
          {errors.provinceId && (
            <p className="text-xs text-rose-600">{errors.provinceId.message}</p>
          )}
        </div>

        {}
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Distrito
          </label>
          <Controller
            name="districtId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={useDist}
                value={
                  distItems.find((o) => Number(o.value) === value) ??
                  idToOption(value, districtLabel ?? watch("districtLabel"))
                }
                onChange={(opt) => {
                  onChange(opt ? Number(opt.value) : undefined);
                  setValue("districtLabel", opt?.label ?? "", {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
                }}
                disabled={!watch("departmentId") || !watch("provinceId")}
                placeholder="Buscar distrito…"
                pageSize={10}
                minSearchChars={0}
              />
            )}
          />
          {errors.districtId && (
            <p className="text-xs text-rose-600">{errors.districtId.message}</p>
          )}
        </div>

        {}
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Dirección
          </label>
          <Controller
            name="address"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <UpperInput
                  id="address"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  placeholder="Ej: CALLE LAS BRIANAS 145"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                />
                {fieldState.error && (
                  <p className="text-xs text-rose-600">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!isValid || saving || isSubmitting}
            className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
