import type { ActivityOpporCreateDto } from "@/application";
import {
  useActivityStateOptions,
  useActivityTypeOptions,
  usePriorityStateOptions,
  useWorkerProyectOptions,
} from "@/sharedKernel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import { z } from "zod";



import { RHFDate } from "./form/RHFDate";
import { RHFSearchSelect } from "./form/RHFSearchSelect";
import { RHFUpperInputWithCounter } from "./form/RHFUpperInputWithCounter";

const schema = z
  .object({
    projectToken: z.string().trim().optional(),
    workerSenderId: z.number().optional(),
    activityState: z.number().optional(),
    activityType: z.number().optional(),
    activityPriority: z.number().optional(),
    activityMessage: z
      .string()
      .min(5, "Debe tener al menos 5 caracteres.")
      .max(35, "No puede exceder los 35 caracteres."),
    messageAddition: z
      .string()
      .max(55, "No puede exceder los 55 caracteres.")
      .optional(),
    messageDate: z.date().optional(),
    finishDate: z.date().optional(),

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
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues as ActivityOpporCreateDto),
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues as ActivityOpporCreateDto));
  }, [defaultValues, reset]);

  const { data: workerSenderResp } = useWorkerProyectOptions();
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

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) =>
        onSubmit({
          projectToken: values.projectToken,
          workerSenderId: values.workerSenderId,
          activityState: values.activityState,
          activityType: values.activityType,
          activityPriority: values.activityPriority,
          activityMessage: values.activityMessage,
          messageAddition: values.messageAddition,
          messageDate: values.messageDate,
          finishDate: values.finishDate,
        }),
        (errors) => {
          // evita "no hace nada"
          console.warn("Errores del formulario:", errors);
          // si usas Swal/toast:
          // showWarning("Revisa el formulario", "Hay campos inválidos o vacíos.");
        }
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
        />

        <RHFSearchSelect<FormValues>
          name="workerSenderId"
          control={control}
          label="Asignar Responsable"
          options={workerSenderOptions}
          placeholder="Busca al responsable"
          fallbackLabel={workerSenderLabel}
        />

        <RHFSearchSelect<FormValues>
          name="activityState"
          control={control}
          label="Estado"
          options={activityStateOptions}
          placeholder="Busca el estado de actividad"
          fallbackLabel={activityStateLabel}
        />

        <RHFSearchSelect<FormValues>
          name="activityPriority"
          control={control}
          label="Prioridad"
          options={activityPriorityOptions}
          placeholder="Busca la prioridad"
          fallbackLabel={activityPriorityLabel}
        />

        <RHFDate<FormValues>
          name="messageDate"
          control={control}
          label="Fecha de Inicio"
        />
        <RHFDate<FormValues>
          name="finishDate"
          control={control}
          label="Fecha de Fin"
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
