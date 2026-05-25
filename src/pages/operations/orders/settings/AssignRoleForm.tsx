import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { useSalesWorkerOptions } from "@/sharedKernel"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  workerId: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

const idToOption = (id?: number | null, label?: string) =>
  id != null && label ? { value: id, label: label } : null;

export function AssignRoleForm({
  formId,
  defaultValues,
  onSubmit,
  saving,
  workerLabel,
}: {
  formId: string;
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: { workerId?: number | null; workerName?: string | null }) => void;
  saving: boolean;
  workerLabel?: string;
}) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { workerId: defaultValues?.workerId ?? null },
  });

  useEffect(() => {
    reset({ workerId: defaultValues?.workerId ?? null });
  }, [defaultValues, reset]);

  const { data: workerResp } = useSalesWorkerOptions();
  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);

  const handleFormSubmit = (values: FormValues) => {
    // Buscamos el nombre del trabajador seleccionado en las opciones
    const selectedOpt = workerOptions.find((o: OptionItem) => Number(o.value) === values.workerId);
    
    onSubmit({
      workerId: values.workerId,
      workerName: selectedOpt ? selectedOpt.label : null,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Seleccionar Especialista
        </label>
        <Controller
          name="workerId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <SearchSelect
              useOptions={() => ({ data: { items: workerOptions } }) as any}
              value={
                workerOptions.find((o: OptionItem) => Number(o.value) === value) ??
                idToOption(value, workerLabel)
              }
              onChange={(opt) => onChange(opt ? Number(opt.value) : null)}
              placeholder="Buscar especialista..."
              pageSize={10}
              minSearchChars={0}
              className="w-full min-w-0"
              disabled={saving} 
            />
          )}
        />
      </div>
    </form>
  );
}