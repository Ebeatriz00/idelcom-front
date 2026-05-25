import { Modal, Button, SearchSelect } from "@/layouts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Users } from "lucide-react";
import { useWorkerOperationsOptions, useWorkerSquadOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { useState, useEffect, useCallback } from "react";
import type { OptionItem } from "@/application";

const schema = z.object({
  workerId: z.number({ required_error: "Debe seleccionar un trabajador" }).min(1, "Debe seleccionar un trabajador"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  finishDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PersonnelAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  saving: boolean;
  squadName?: string;
  operationsId?: number;
  isAdministrative?: boolean;
}

export function PersonnelAssignmentModal({
  open,
  onClose,
  onSubmit,
  saving,
  squadName,
  operationsId,
  isAdministrative = false,
}: PersonnelAssignmentModalProps) {
  const [selectedWorker, setSelectedWorker] = useState<OptionItem | null>(null);

  const useWorkerSquadOptionsLocal = useCallback(
    (page: number, search: string, pageSize: number) => {
      return useWorkerSquadOptions(operationsId || 0, page, search, pageSize);
    },
    [operationsId]
  );

  const selectedUseOptions = isAdministrative ? useWorkerSquadOptionsLocal : useWorkerOperationsOptions;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      workerId: 0,
    },
  });

  useEffect(() => {
    if (!open) {
      setSelectedWorker(null);
      reset({
        startDate: new Date().toISOString().split("T")[0],
        workerId: 0,
        finishDate: "",
        notes: ""
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (values: FormValues) => {
    const data = {
      ...values,
      finishDate: values.finishDate || null,
      notes: values.notes || null,
    };
    onSubmit(data);
  };

  if (!open) return null;

  const formId = "personnel-assignment-form";

  return (
    <Modal
      title={`Agregar Personal - ${squadName ?? "Cuadrilla"}`}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar Trabajador"
            )}
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
              <Users className="size-3 text-gray-400" />
              Seleccionar Trabajador
            </label>
            <Controller
              name="workerId"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  useOptions={selectedUseOptions}
                  value={selectedWorker}
                  onChange={(opt) => {
                    setSelectedWorker(opt);
                    field.onChange(opt ? Number(opt.value) : 0);
                  }}
                  placeholder="Buscar trabajador..."
                  disabled={saving}
                  className={errors.workerId ? "border-red-500" : ""}
                />
              )}
            />
            {errors.workerId && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{errors.workerId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Fecha Inicio Asignación</label>
              <input
                type="date"
                {...register("startDate")}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.startDate ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="text-[10px] text-red-500 font-bold uppercase">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Fecha Fin (Opcional)</label>
              <input
                type="date"
                {...register("finishDate")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Notas adicionales</label>
            <textarea
              placeholder="Ej: Solo asignado para esta fase del proyecto..."
              {...register("notes")}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
