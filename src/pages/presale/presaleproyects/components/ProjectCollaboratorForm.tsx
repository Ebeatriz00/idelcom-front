import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { useWorkerProyectOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { Trash2, User } from "lucide-react"; 
import { useEffect, useMemo, useState } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import { z } from "zod";

export type ProjectCollaboratorBatchDto = {
  projectToken: string;
  businessId: number;
  workersId: number[];
};

const schema = z.object({
  projectToken: z.string().min(1, "Se requiere projectToken"),
  businessId: z.number().min(1, "Se requiere businessId"),
});

type FormValues = z.infer<typeof schema>;

function mapToFormValues(
  dto?: Partial<FormValues>
): DefaultValues<FormValues> {
  return {
    projectToken: dto?.projectToken ?? "",
    businessId: dto?.businessId ?? 0,
  };
}

export function ProjectCollaboratorForm({
  defaultValues,
  onSubmit,
  formId,
  saving, 
}: {
  defaultValues: Partial<FormValues>;
  onSubmit: (dto: ProjectCollaboratorBatchDto) => Promise<void> | void;
  saving?: boolean;
  formId?: string;
}) {
  const { handleSubmit, reset, getValues } = useForm<FormValues>({
    resolver: (values) => ({ values, errors: {} }),
    defaultValues: mapToFormValues(defaultValues),
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  const [stagedCollaborators, setStagedCollaborators] = useState<OptionItem[]>(
    []
  );
  const [selectedWorker, setSelectedWorker] = useState<OptionItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: workerResp } = useWorkerProyectOptions();
  const workerOptions = useMemo(() => workerResp?.items ?? [], [workerResp]);


  const handleSelectAndAdd = (opt: OptionItem | null) => {
    if (!opt) {
      setSelectedWorker(null);
      return;
    }

    setError(null);
    if (stagedCollaborators.find((w) => w.value === opt.value)) {
      setError("Ese colaborador ya está en la lista.");
      setSelectedWorker(opt); 
      return;
    }

    setStagedCollaborators((prev) => [...prev, opt]);
    setSelectedWorker(null);
  };

  const handleRemove = (valueToRemove: string | number) => {
    setStagedCollaborators((prev) =>
      prev.filter((w) => w.value !== valueToRemove)
    );
  };

  const onFormSubmit = async () => {
    setError(null);
    if (stagedCollaborators.length === 0) {
      setError("Debes agregar al menos un colaborador a la lista.");
      return;
    }

    const hiddenValues = getValues();

    const dto: ProjectCollaboratorBatchDto = {
      ...hiddenValues,
      workersId: stagedCollaborators.map((w) => Number(w.value)),
    };

    await onSubmit(dto);
    setStagedCollaborators([]);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 p-4"
    >
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Colaborador
        </label>
        <SearchSelect
          useOptions={() => ({ data: { items: workerOptions } } as any)}
          value={selectedWorker}
          onChange={handleSelectAndAdd}
          placeholder="Buscar colaborador..."
          pageSize={10}
          className="w-full min-w-0"
          disabled={saving} 
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-800">
          Colaboradores a Agregar ({stagedCollaborators.length})
        </h4>
        {stagedCollaborators.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-md mt-2">
            Aún no has agregado colaboradores.
          </p>
        ) : (
          <div className="mt-2 border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {stagedCollaborators.map((worker) => (
                  <tr key={worker.value}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="flex items-center gap-2">
                        <User className="size-4 text-gray-500" />
                        {worker.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(worker.value)}
                        className="p-1 rounded-md text-red-600 hover:bg-red-50"
                        title="Quitar"
                        disabled={saving} 
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </form>
  );
}