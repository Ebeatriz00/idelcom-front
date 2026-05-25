import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWorkerProyectOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { RHFSearchSelect } from "@/pages/crm/opportunity/components/detail/modal/form/RHFSearchSelect"; 

const schema = z.object({
  linkToken: z.string(),
  workerId: z.number({
    required_error: "Debes seleccionar un especialista",
    invalid_type_error: "Debes seleccionar un especialista",
  }),
  projectCategory: z.coerce.number().min(1, "Debes seleccionar una categoría") 
});

type FormValues = z.infer<typeof schema>;

export function ResponsibleForm({
  defaultValues,
  onSubmit,
  formId,
  workerLabel,
  saving, 
}: {
  defaultValues: { linkToken: string; workerId?: number; projectCategory?: number };
  onSubmit: (data: FormValues) => void;
  saving: boolean;
  formId: string;
  workerLabel?: string;
}) {
  const {
    control,
    register, 
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      linkToken: defaultValues.linkToken,
      workerId: defaultValues.workerId,
      projectCategory: defaultValues.projectCategory ?? 0 
    },
  });

  const { data: workerResp } = useWorkerProyectOptions();
  const workerOptions = useMemo(
    () => workerResp?.items ?? [],
    [workerResp]
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <input type="hidden" {...register("linkToken")} />

      <div className="col-span-full min-w-0">
        <RHFSearchSelect<FormValues>
          name="workerId"
          label="Nuevo Especialista"
          options={workerOptions}
          control={control}
          placeholder="Busca un especialista..."
          fallbackLabel={workerLabel}
          disabled={saving} 
        />
      </div>

      <div className="col-span-full min-w-0">
        <label 
          htmlFor="projectCategory" 
          className="mb-1 block text-xs font-medium text-gray-600"
        >
          Categoría del Proyecto
        </label>
        
        <select
          id="projectCategory"
          {...register("projectCategory")}
          disabled={saving}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="0" disabled>Seleccione...</option>
          <option value="1">Estratégico</option>
          <option value="2">Complementario</option>
        </select>
        
        {errors.projectCategory && (
          <p className="mt-1 text-xs text-red-600">{errors.projectCategory.message}</p>
        )}
      </div>

    </form>
  );
}