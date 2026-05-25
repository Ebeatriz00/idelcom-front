import type { OptionItem, TasksUpsertDto } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import { useWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { usePriorityStateOptions } from "@/sharedKernel/hooks/sttask/usePriorityState";
import { useStateTaskOptions } from "@/sharedKernel/hooks/sttask/useStateTask";
import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCrmOpporPerms } from "../../opportunity/hooks/oppor.perms";

// --- ESQUEMA ZOD (Todo obligatorio) ---
const schema = z.object({
  linkToken: z.string().optional(),
  opporToken: z.string().optional(),
  
  title: z
    .string({ required_error: "El título es requerido" })
    .min(1, "El título es requerido")
    .max(100, "Máximo 100 caracteres"),
    
  description: z
    .string({ required_error: "La descripción es requerida" })
    .min(1, "La descripción es requerida")
    .max(400, "Máximo 400 caracteres"),

  stateTaskId: z.number({
    required_error: "Seleccione un estado",
    invalid_type_error: "Seleccione un estado",
  }),

  priorityStateId: z.number({
    required_error: "Seleccione una prioridad",
    invalid_type_error: "Seleccione una prioridad",
  }),

  workerId: z.number({
    required_error: "Seleccione un responsable",
    invalid_type_error: "Seleccione un responsable",
  }),

  endDate: z
    .string({ required_error: "La fecha es requerida" })
    .min(1, "La fecha es requerida"),

  time: z
    .string({ required_error: "La hora es requerida" })
    .min(1, "La hora es requerida"),
});

type FormValues = z.infer<typeof schema>;

const timeOptions = Array.from({ length: 20 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const label = `${displayHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;
  return { value, label };
});

export function TasksForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  workerLabel,
}: {
  defaultValues?: Partial<TasksUpsertDto>;
  onSubmit: (dto: TasksUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  opportunityLabel?: string;
  stateTaskLabel?: string;
  workerLabel?: string;
  priorityStateLabel?: string;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      linkToken: defaultValues?.linkToken,
      opporToken: defaultValues?.opporToken ?? undefined,
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      stateTaskId: defaultValues?.stateTaskId,
      workerId: defaultValues?.workerId,
      priorityStateId: defaultValues?.priorityStateId,
      endDate: defaultValues?.endDate
        ? defaultValues.endDate.toString().split("T")[0]
        : "",
      time: defaultValues?.time ?? "",
    },
  });

  const { data: stateTaskResp } = useStateTaskOptions(1, "", 50);
  const stateTaskOptions = useMemo(() => stateTaskResp?.items ?? [], [stateTaskResp]);

  const { data: workerResp } = useWorkerOptions();
  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const { data: priorityStateResp } = usePriorityStateOptions();
  const priorityStateOptions = useMemo(() => priorityStateResp?.items ?? [], [priorityStateResp]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        linkToken: defaultValues.linkToken,
        opporToken: defaultValues.opporToken ?? undefined,
        title: defaultValues.title ?? "",
        description: defaultValues.description ?? "",
        stateTaskId: defaultValues.stateTaskId,
        workerId: defaultValues.workerId,
        priorityStateId: defaultValues.priorityStateId,
        endDate: defaultValues.endDate
          ? defaultValues.endDate.toString().split("T")[0]
          : "",
        time: defaultValues.time ?? "",
      });
    }
  }, [defaultValues, reset]);

  const stateTaskId = watch("stateTaskId");
  useEffect(() => {
    if (stateTaskId) return;
    if (stateTaskOptions.length > 0) {
      const pending = stateTaskOptions.find((o) =>
        o.label.toLowerCase().includes("pendiente")
      );
      setValue(
        "stateTaskId",
        pending ? Number(pending.value) : Number(stateTaskOptions[0].value)
      );
    }
  }, [stateTaskOptions, stateTaskId, setValue]);

  const priorityStateId = watch("priorityStateId");
  useEffect(() => {
    if (priorityStateId) return;
    if (priorityStateOptions.length > 0) {
      const normal = priorityStateOptions.find((o) =>
        o.label.toLowerCase().includes("normal")
      );
      setValue(
        "priorityStateId",
        normal ? Number(normal.value) : Number(priorityStateOptions[0].value)
      );
    }
  }, [priorityStateOptions, priorityStateId, setValue]);

  const { canUseSellerOption } = useCrmOpporPerms();
  const currentWorkerId = useAuth((s) => s.workerId);
  
  useEffect(() => {
    if (!canUseSellerOption && currentWorkerId != null) {
      setValue("workerId", Number(currentWorkerId), { shouldValidate: true });
    }
  }, [canUseSellerOption, currentWorkerId, setValue]);

  const baseInputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((data) => {
        onSubmit({
          linkToken: data.linkToken,
          title: data.title,
          description: data.description,
          opporToken: (data.opporToken ?? null) as any,
          stateTaskId: data.stateTaskId,
          workerId: data.workerId,
          priorityStateId: data.priorityStateId,
          endDate: data.endDate,
          time: data.time, 
        });
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        
        {/* TITULO */}
        <div className="col-span-full">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Título <span className="text-rose-600">*</span>
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <UpperInput
                  mode="upper"
                  {...field}
                  onValueChange={field.onChange}
                  autoFocus={autofocus}
                  placeholder="EJ: LLAMAR AL CLIENTE PARA SEGUIMIENTO"
                  maxLength={100}
                  className={baseInputClass}
                />
                {fieldState.error && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* DESCRIPCION */}
        <div className="col-span-full">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción <span className="text-rose-600">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <textarea
                  {...field}
                  placeholder="Añade una descripción detallada de la tarea..."
                  maxLength={400}
                  rows={3}
                  className={baseInputClass}
                />
                {fieldState.error && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* RESPONSABLE */}
        {canUseSellerOption ? (
          <div className="col-span-full">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Responsable <span className="text-rose-600">*</span>
            </label>
            <Controller
              name="workerId"
              control={control}
              render={({ field, fieldState }) => {
                const currentVal = workerOptions.find(
                  (o) => Number(o.value) === field.value
                ) || (field.value && workerLabel ? { value: field.value, label: workerLabel } : null);

                return (
                  <>
                    <SearchSelect
                      useOptions={useWorkerOptions}
                      value={currentVal as OptionItem | null}
                      onChange={(opt) => {
                        field.onChange(opt ? Number(opt.value) : undefined);
                      }}
                      placeholder="Buscar responsable..."
                      pageSize={10}
                      minSearchChars={0}
                      className="w-full min-w-0"
                    />
                    {fieldState.error && (
                      <p className="mt-1 text-xs text-rose-600">
                        {fieldState.error.message}
                      </p>
                    )}  
                  </>
                );
              }}
            />
          </div>
        ) : (
          <Controller
            name="workerId"
            control={control}
            render={({ field }) => (
              <input type="hidden" {...field} value={field.value ?? ""} />
            )}
          />
        )}

        {/* FECHA Y HORA (Ahora obligatorios y con asterisco) */}
        <div className="col-span-full">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Vence <span className="text-rose-600">*</span>
              </label>
              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="date"
                      {...field}
                      className={baseInputClass}
                      placeholder="YYYY-MM-DD"
                    />
                    {fieldState.error && (
                      <p className="mt-1 text-xs text-rose-600">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Hora <span className="text-rose-600">*</span>
              </label>
              <Controller
                name="time"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <select {...field} className={baseInputClass}>
                      <option value="">-- Hora --</option>
                      {timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {fieldState.error && (
                      <p className="mt-1 text-xs text-rose-600">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}