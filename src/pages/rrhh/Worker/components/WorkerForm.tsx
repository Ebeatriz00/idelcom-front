import type { OptionItem, WorkerUpsertDto } from "@/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  makeUseOptionsDistrict,
  makeUseOptionsProvince,
  useOptionsDepartment,
} from "@/sharedKernel";
import { useEffect } from "react";
import { AddressCascade } from "./form/AddressCascade";
import { RHFDate } from "./form/fields/RHFDate";
import { RHFSearchSelect } from "./form/fields/RHFSearchSelect";
import { RHFText } from "./form/fields/RHFText";
import { mapToFormValues } from "./form/mapToFormValues";
import { workerSchema, type WorkerFormValues } from "./form/schema";
import { useStaticOptions } from "./form/useOptions";

export function WorkerForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  documentTypeLabel,
  jobTitleLabel,
  departmentLabel,
  provinceLabel,
  districtLabel,
  bankTypeLabel,
  areaLabel,
}: {
  defaultValues?: Partial<WorkerFormValues>;
  onSubmit: (dto: WorkerUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  jobTitleLabel?: string;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  documentTypeLabel?: string;
  bankTypeLabel?: string;
  areaLabel?: string;
}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues),
  });
  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  const { docTypeOptions, jobTitleOptions, areaOptions, bankOptions } =
    useStaticOptions();

  const deptResp: any = useOptionsDepartment() as any;
  const deptData = deptResp(1, "", 1000);
  const deptItems: OptionItem[] = deptData?.data?.items ?? [];

  const makeProv = makeUseOptionsProvince;
  const makeDist = makeUseOptionsDistrict;
  const provResp = makeProv(watch("departmentId") ?? null)(1, "", 1000);
  const distResp = makeDist(
    watch("departmentId") ?? null,
    watch("provinceId") ?? null
  )(1, "", 1000);
  const provItems: OptionItem[] = provResp?.data?.items ?? [];
  const distItems: OptionItem[] = distResp?.data?.items ?? [];

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        const dto: WorkerUpsertDto = {
          workerId: values.workerId,
          areaId: values.areaId,
          jobTitleId: values.jobTitleId,
          prevJob: values.prevJob ?? undefined,
          workerName: values.workerName.trim(),
          workerLastName: values.workerLastName.trim(),
          documentTypeId: values.documentTypeId!,
          workerDocument: values.workerDocument.trim(),
          departmentId: values.departmentId ?? undefined,
          provinceId: values.provinceId ?? undefined,
          districtId: values.districtId ?? undefined,
          address: values.address?.trim() ?? undefined,
          phone: values.phone ?? undefined,
          email: values.email ?? undefined,
          birthDate: values.birthDate ?? undefined,
          dateEntry: values.dateEntry ?? undefined,
          dateCes: values.dateCes ?? undefined,
          bankId: values.bankId ?? undefined,
          ccBank: values.ccBank ?? undefined,
          cciBank: values.cciBank ?? undefined,
          salary: values.salary ?? undefined,
          numberChildren: values.numberChildren ?? undefined,
        };
        onSubmit(dto);
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="col-span-full lg:col-span-6">
          <RHFText
            name="workerName"
            control={control}
            label="Nombres"
            placeholder="Ej: JUAN CARLOS"
          />
        </div>
        <div className="col-span-full lg:col-span-6">
          <RHFText
            name="workerLastName"
            control={control}
            label="Apellidos"
            placeholder="Ej: PÉREZ GARCÍA"
          />
        </div>
        <div className="col-span-full lg:col-span-7">
          <RHFSearchSelect
            name="documentTypeId"
            control={control}
            label="Tipo de documento"
            useOptions={() => ({ data: { items: docTypeOptions } } as any)}
            items={docTypeOptions}
            valueLabel={documentTypeLabel}
            placeholder="Buscar tipo de documento…"
          />
        </div>
        <div className="col-span-full lg:col-span-5">
          <RHFText
            name="workerDocument"
            control={control}
            label="N° de documento"
            placeholder="Ej: 89647526"
          />
        </div>
        <div className="col-span-full lg:col-span-6">
          <RHFSearchSelect
            name="jobTitleId"
            control={control}
            label="Cargo"
            useOptions={() => ({ data: { items: jobTitleOptions } } as any)}
            items={jobTitleOptions}
            valueLabel={jobTitleLabel}
            placeholder="Buscar cargo…"
          />
        </div>
        <div className="col-span-full lg:col-span-6">
          <RHFSearchSelect
            name="areaId"
            control={control}
            label="Área"
            useOptions={() => ({ data: { items: areaOptions } } as any)}
            items={areaOptions}
            valueLabel={areaLabel}
            placeholder="Buscar área…"
          />
        </div>
        <AddressCascade
          control={control}
          watch={watch}
          setValue={setValue}
          deptItems={deptItems}
          provItems={provItems}
          distItems={distItems}
          labels={{
            department: departmentLabel,
            province: provinceLabel,
            district: districtLabel,
          }}
        />
        <div className="col-span-full lg:col-span-6">
          <RHFText
            name="address"
            control={control}
            label="Dirección"
            placeholder="Ej: CALLE LAS BRIANAS 145"
          />
        </div>
        <div className="col-span-full lg:col-span-6">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Celular
          </label>
          <input
            id="phone"
            inputMode="tel"
            placeholder="Ej: 987654321"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("phone")}
          />
        </div>

        <div className="col-span-full lg:col-span-6">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("email")}
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFDate
            name="birthDate"
            control={control}
            label="Fecha de nacimiento"
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFDate
            name="dateEntry"
            control={control}
            label="Fecha de ingreso"
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFDate name="dateCes" control={control} label="Fecha de cese" />
        </div>

        <div className="col-span-full lg:col-span-4">
          <RHFSearchSelect
            name="bankId"
            control={control}
            label="Banco"
            useOptions={() => ({ data: { items: bankOptions } } as any)}
            items={bankOptions}
            valueLabel={bankTypeLabel}
            placeholder="Buscar banco…"
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFText
            name="ccBank"
            control={control}
            label="Cuenta bancaria"
            placeholder="Ej: 0011-123456789"
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFText
            name="cciBank"
            control={control}
            label="CCI"
            placeholder="Ej: 002-123456789012345678-90"
          />
        </div>

        <div className="col-span-full lg:col-span-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Salario (S/)
          </label>
          <input
            id="salary"
            inputMode="decimal"
            placeholder="Ej: 2500"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("salary" as const)}
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            N° de hijos
          </label>
          <input
            id="numberChildren"
            inputMode="numeric"
            placeholder="0"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("numberChildren" as const)}
          />
        </div>
        <div className="col-span-full lg:col-span-4">
          <RHFText
            name="prevJob"
            control={control}
            label="Empleo previo"
            placeholder="Ej: OPERARIO DE PRODUCCIÓN"
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
