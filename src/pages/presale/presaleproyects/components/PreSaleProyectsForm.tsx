import type { OptionItem } from "@/application";
import type { PreSaleProyectsUpsertDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import { SearchSelect, UpperInput } from "@/layouts";
import { useClientsOptions, useOpportunitiesOptions } from "@/sharedKernel";
import { useWorkerProyectOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { useStatePreSaleOptions } from "@/sharedKernel/hooks/stpresale/useStatePreSale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { RHFSearchSelect } from "./detail/modal/form/RHFSearchSelect";

const schema = z
  .object({
    linkToken: z.string().optional(),
    proyectNum: z.string().optional(),
    description: z.string().trim().min(3, "Mínimo 3 caracteres"),

    clientsId: z.number({ invalid_type_error: "Cliente Requerido" }),
    contactsCrmId: z.number().optional().nullable(),
    opportunityId: z.number({ invalid_type_error: "Oportunidad Requerida" }),
    statePreSaleId: z.number({ invalid_type_error: "Estado Requerido" }),

    startDate: z.preprocess(
      (v) => (v == null || v === "" ? undefined : new Date(String(v))),
      z.date({ invalid_type_error: "Fecha de inicio requerida" }),
    ),
    endDate: z.preprocess(
      (v) => (v == null || v === "" ? undefined : new Date(String(v))),
      z.date({ invalid_type_error: "Fecha de fin requerida" }),
    ),

    responsibleId: z.number().optional().nullable(),
    supervisorId: z.number().optional().nullable(),
    ssomaId: z.number().optional().nullable(),
    tecLeaderId: z.number().optional().nullable(),
    quotationNumberId: z.number().optional().nullable(),
    orderNumberId: z.number().optional().nullable(),

    orderDate: z.preprocess(
      (v) => (v == null || v === "" ? undefined : new Date(String(v))),
      z.date().optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["endDate"],
    },
  );

type FormValues = z.infer<typeof schema>;

const formatDateForInput = (date?: Date | string | null): string => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

function mapToFormValues(d?: Partial<FormValues>): Partial<FormValues> {
  if (!d) return {};
  return {
    ...d,
    proyectNum: d.proyectNum ?? undefined,
    description: d.description ?? "",
    startDate: formatDateForInput(d.startDate) as any,
    endDate: formatDateForInput(d.endDate) as any,
    orderDate: formatDateForInput(d.orderDate) as any,
  };
}

const idToOption = (id?: number | null, label?: string) =>
  id != null && label ? { value: id, label: label } : null;

export function PreSaleProyectsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  clientsLabel,
  responsibleLabel,
  supervisorLabel,
  ssomaLabel,
  tecLeaderLabel,
  opportunityLabel,
  statePreSaleLabel,
  quotationNumberLabel,
  orderNumberLabel,
}: {
  defaultValues?: Partial<PreSaleProyectsUpsertDto>;
  onSubmit: (dto: PreSaleProyectsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  clientsLabel?: string;
  contactsCrmLabel?: string;
  responsibleLabel?: string;
  supervisorLabel?: string;
  ssomaLabel?: string;
  tecLeaderLabel?: string;
  opportunityLabel?: string;
  statePreSaleLabel?: string;
  quotationNumberLabel?: string;
  orderNumberLabel?: string;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues),
  });

  const watchId = watch("linkToken");
  const isEditing = !!watchId;

  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  const { data: clientResp } = useClientsOptions();
  const clientOptions: OptionItem[] = clientResp?.items ?? [];

  const { data: workerResp } = useWorkerProyectOptions();
  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const { data: oppResp } = useOpportunitiesOptions(0);
  const opportunityOptions: OptionItem[] = oppResp?.items ?? [];

  const { data: stateResp } = useStatePreSaleOptions();
  const statePreSaleOptions: OptionItem[] = stateResp?.items ?? [];

  const quotationNumberOptions: OptionItem[] = [];
  const orderNumberOptions: OptionItem[] = [];

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(
        (values) =>
          onSubmit({
            linkToken: values.linkToken,
            proyectNum: values.proyectNum,
            description: values.description.trim(),
            clientsId: values.clientsId!,
            contactsCrmId: values.contactsCrmId!,
            opportunityId: values.opportunityId!,
            statePreSaleId: values.statePreSaleId!,
            startDate: values.startDate as Date,
            endDate: values.endDate as Date,
            responsibleId: values.responsibleId ?? undefined,
            supervisorId: values.supervisorId ?? undefined,
            ssomaId: values.ssomaId ?? undefined,
            tecLeaderId: values.tecLeaderId ?? undefined,
            quotationNumberId: values.quotationNumberId ?? undefined,
            orderNumberId: values.orderNumberId ?? undefined,
            orderDate: values.orderDate
              ? new Date(values.orderDate)
              : undefined,
          }),
        (errors) => {
          console.warn("Errores del formulario:", errors);
        },
      )}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {isEditing && (
          <div className="col-span-full lg:col-span-6 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Código de Proyecto
            </label>
            <input
              id="proyectNum"
              type="text"
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-200 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              {...register("proyectNum")}
            />
          </div>
        )}

        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Oportunidad
          </label>
          <Controller
            name="opportunityId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() =>
                  ({ data: { items: opportunityOptions } }) as any
                }
                value={
                  opportunityOptions.find(
                    (o: OptionItem) => Number(o.value) === value,
                  ) ?? idToOption(value, opportunityLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar oportunidad..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.opportunityId && (
            <p className="text-xs text-rose-600">
              {errors.opportunityId.message}
            </p>
          )}
        </div>

        <div
          className={`col-span-full ${
            isEditing ? "lg:col-span-12" : "lg:col-span-12"
          } min-w-0`}
        >
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción del Proyecto
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
                  autoFocus={autofocus}
                  placeholder="EJ: PROYECTO DE INSTALACIÓN..."
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
            Cliente
          </label>
          <Controller
            name="clientsId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() => ({ data: { items: clientOptions } }) as any}
                value={
                  clientOptions.find(
                    (o: OptionItem) => Number(o.value) === value,
                  ) ?? idToOption(value, clientsLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar cliente..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.clientsId && (
            <p className="text-xs text-rose-600">{errors.clientsId.message}</p>
          )}
        </div>

        {/*<div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Contacto
          </label>
          <Controller
            name="contactsCrmId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() => ({ data: { items: contactsOptions } } as any)}
                value={
                  contactsOptions.find(
                    (o: OptionItem) => Number(o.value) === value
                  ) ?? idToOption(value, contactsCrmLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar contacto..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )
          />
          {errors.contactsCrmId && (
            <p className="text-xs text-rose-600">
              {errors.contactsCrmId.message}
            </p>
          )}
        </div>}*/}

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Estado
          </label>
          <Controller
            name="statePreSaleId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() =>
                  ({ data: { items: statePreSaleOptions } }) as any
                }
                value={
                  statePreSaleOptions.find(
                    (o: OptionItem) => Number(o.value) === value,
                  ) ?? idToOption(value, statePreSaleLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar estado..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.statePreSaleId && (
            <p className="text-xs text-rose-600">
              {errors.statePreSaleId.message}
            </p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Fecha de Inicio
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-xs text-rose-600">{errors.startDate.message}</p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Fecha de Fin
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-xs text-rose-600">{errors.endDate.message}</p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <RHFSearchSelect<FormValues>
            name={"responsibleId"}
            label={"Responsable"}
            options={workerOptions}
            control={control}
            fallbackLabel={responsibleLabel}
            placeholder="Seleccione Responsable…"
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <RHFSearchSelect<FormValues>
            name={"supervisorId"}
            label={"Supervisor"}
            options={workerOptions}
            control={control}
            fallbackLabel={supervisorLabel}
            placeholder="Seleccione Supervisor…"
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <RHFSearchSelect<FormValues>
            name={"ssomaId"}
            label={"Ssoma"}
            options={workerOptions}
            control={control}
            fallbackLabel={ssomaLabel}
            placeholder="Seleccione Ssoma…"
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <RHFSearchSelect<FormValues>
            name={"tecLeaderId"}
            label={"Lider Tecnico"}
            options={workerOptions}
            control={control}
            fallbackLabel={tecLeaderLabel}
            placeholder="Seleccione Lider Tecnico…"
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            N° Cotización (Opcional)
          </label>
          <Controller
            name="quotationNumberId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() =>
                  ({ data: { items: quotationNumberOptions } }) as any
                }
                value={
                  quotationNumberOptions.find(
                    (o: OptionItem) => Number(o.value) === value,
                  ) ?? idToOption(value, quotationNumberLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar cotización..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.quotationNumberId && (
            <p className="text-xs text-rose-600">
              {errors.quotationNumberId.message}
            </p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            N° Orden (Opcional)
          </label>
          <Controller
            name="orderNumberId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SearchSelect
                useOptions={() =>
                  ({ data: { items: orderNumberOptions } }) as any
                }
                value={
                  orderNumberOptions.find(
                    (o: OptionItem) => Number(o.value) === value,
                  ) ?? idToOption(value, orderNumberLabel)
                }
                onChange={(opt) =>
                  onChange(opt ? Number(opt.value) : undefined)
                }
                placeholder="Buscar orden..."
                pageSize={10}
                minSearchChars={0}
                className="w-full min-w-0"
              />
            )}
          />
          {errors.orderNumberId && (
            <p className="text-xs text-rose-600">
              {errors.orderNumberId.message}
            </p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Fecha de Orden (Opcional)
          </label>
          <input
            id="orderDate"
            type="date"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            {...register("orderDate")}
          />
          {errors.orderDate && (
            <p className="text-xs text-rose-600">{errors.orderDate.message}</p>
          )}
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
