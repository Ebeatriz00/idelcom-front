import type { ActivityOpporCreateDto } from "@/application";
import {
  useActivityStateOptions,
  useActivityTypeOptions,
  usePriorityStateOptions,
  useSalesWorkerOptions,
} from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { z } from "zod";
import { useCrmOpporPerms } from "../../../hooks/oppor.perms";
import { RHFDate } from "./form/RHFDate";
import { RHFSearchSelect } from "./form/RHFSearchSelect";
import { RHFUpperInputWithCounter } from "./form/RHFUpperInputWithCounter";

const schema = z
  .object({
    opporToken: z.string().trim().optional(),

    workerSenderId: z.number({
      required_error: "Seleccione un responsable", 
      invalid_type_error: "Seleccione un responsable",
    }),

    activityState: z.number({
      required_error: "Seleccione un estado",
      invalid_type_error: "Seleccione un estado",
    }),

    activityType: z.number({
      required_error: "Seleccione un tipo",
      invalid_type_error: "Seleccione un tipo",
    }),

    activityPriority: z.number({
      required_error: "Seleccione una prioridad",
      invalid_type_error: "Seleccione una prioridad",
    }),

    activityMessage: z
      .string({ required_error: "La actividad es requerida" }) 
      .min(5, "Debe tener al menos 5 caracteres.")
      .max(35, "No puede exceder los 35 caracteres."),
      
    messageAddition: z
      .string()
      .max(55, "No puede exceder los 55 caracteres.")
      .optional(),
      
    messageDate: z.date({
      required_error: "Seleccione una fecha de inicio",
      invalid_type_error: "Fecha inválida",
    }),

    finishDate: z.date({
      required_error: "Seleccione una fecha de fin",
      invalid_type_error: "Fecha inválida",
    }),

    // Labels opcionales (no afectan la validación visual del usuario)
    workerSenderLabel: z.string().optional(),
    activityStateLabel: z.string().optional(),
    activityTypeLabel: z.string().optional(),
    activityPriorityLabel: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.messageDate && data.finishDate) {
        return data.finishDate >= data.messageDate;
      }
      return true;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["endDate"],
    }
  );

type FormValues = z.infer<typeof schema>;

function mapToFormValues(
  dto?: Partial<ActivityOpporCreateDto>
): DefaultValues<FormValues> {
  if (!dto) return {} as DefaultValues<FormValues>;
  return {
    ...dto,
    messageDate: dto.messageDate ? new Date(dto.messageDate) : undefined,
    finishDate: dto.finishDate ? new Date(dto.finishDate) : undefined,
  };
}

export function ActivityForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  workerSenderLabel,
  activityStateLabel,
  activityTypeLabel,
  activityPriorityLabel,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (dto: ActivityOpporCreateDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  workerSenderLabel?: string;
  activityStateLabel?: string;
  activityTypeLabel?: string;
  activityPriorityLabel?: string;
}) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues as ActivityOpporCreateDto),
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues as ActivityOpporCreateDto));
  }, [defaultValues, reset]);

  const { data: workerSenderResp } = useSalesWorkerOptions();
  const workerSenderOptions = useMemo(
    () => workerSenderResp?.items ?? [],
    [workerSenderResp]
  );

  const { data: activityStateResp } = useActivityStateOptions();
  const activityStateOptions = useMemo(
    () => activityStateResp?.items ?? [],
    [activityStateResp]
  );

  const { data: activityTypeResp } = useActivityTypeOptions();
  const activityTypeOptions = useMemo(
    () => activityTypeResp?.items ?? [],
    [activityTypeResp]
  );

  const { data: activityPriorityResp } = usePriorityStateOptions();
  const activityPriorityOptions = useMemo(
    () => activityPriorityResp?.items ?? [],
    [activityPriorityResp]
  );

  const { canUseSellerOption } = useCrmOpporPerms();
  const currentWorkerId = useAuth((s) => s.workerId);
  useEffect(() => {
    if (!canUseSellerOption && currentWorkerId != null) {
      setValue("workerSenderId", Number(currentWorkerId), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, currentWorkerId, setValue]);
  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) =>
        onSubmit({
          opporToken: values.opporToken,
          workerSenderId: values.workerSenderId!,
          activityState: values.activityState,
          activityType: values.activityType,
          activityPriority: values.activityPriority,
          activityMessage: values.activityMessage,
          messageAddition: values.messageAddition,
          messageDate: values.messageDate,
          finishDate: values.finishDate,
        })
      )}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <RHFSearchSelect<FormValues>
          name="activityType"
          control={control}
          label="Tipo de actividad"
          
          options={activityTypeOptions}
          placeholder="Busca el tipo de actividad"
          fallbackLabel={activityTypeLabel}
          required
        />

        <RHFUpperInputWithCounter<FormValues>
          name="activityMessage"
          control={control}
          label="Actividad"
          placeholder="Llamar al cliente"
          max={35}
          required
        />

        <RHFUpperInputWithCounter<FormValues>
          name="messageAddition"
          control={control}
          label="Mensaje"
          placeholder="Llamar al cliente para acordar visita"
          max={55}
          required
        />

        {canUseSellerOption ? (
          <RHFSearchSelect<FormValues>
            name="workerSenderId"
            control={control}
            label="Asignar Responsable"
            options={workerSenderOptions}
            placeholder="Busca al responsable"
            fallbackLabel={workerSenderLabel}
            required
          />
        ) : (
          <>
            <Controller
              name="workerSenderId"
              control={control}
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                  value={defaultValues?.workerSenderId ?? ""}
                />
              )}
            />
          </>
        )}

        <RHFSearchSelect<FormValues>
          name="activityState"
          control={control}
          label="Estado"
          options={activityStateOptions}
          placeholder="Busca el estado de actividad"
          fallbackLabel={activityStateLabel}
          required
        />

        <RHFSearchSelect<FormValues>
          name="activityPriority"
          control={control}
          label="Prioridad"
          options={activityPriorityOptions}
          placeholder="Busca la prioridad"
          fallbackLabel={activityPriorityLabel}
          required
        />

        <RHFDate<FormValues>
          name="messageDate"
          control={control}
          label="Fecha de Inicio"
          required
        />
        <RHFDate<FormValues>
          name="finishDate"
          control={control}
          label="Fecha de Fin"
          required
        />
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
