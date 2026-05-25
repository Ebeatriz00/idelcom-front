import { Modal, Button } from "@/layouts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { OperationsSquadResponseDto, OptionItem } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { useWorkerOperationsOptions, useWorkerSquadOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { useConfigProjectById } from "@/sharedKernel";

const schema = z.object({
  squadName: z.string().min(1, "El nombre es requerido"),
  techLeaderId: z.number().min(1, "El líder es requerido"),
  description: z.string().optional(),
  operationsProjectConfigId: z.number().optional().nullable(),
  squadCategory: z.string().default("Normal"),
});

type FormValues = z.infer<typeof schema>;

interface SquadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  saving: boolean;
  initialData?: OperationsSquadResponseDto | null;
  operationsId: number;
}

const defaultValues: FormValues = {
  squadName: "",
  techLeaderId: 0,
  description: "",
  operationsProjectConfigId: null,
  squadCategory: "Normal",
};

export function SquadModal({
  open,
  onClose,
  onSubmit,
  saving,
  initialData,
  operationsId,
}: SquadModalProps) {
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const { data: configs } = useConfigProjectById(operationsId);

  const useWorkerSquadOptionsLocal = useCallback(
    (page: number, search: string, pageSize: number) => {
      return useWorkerSquadOptions(operationsId, page, search, pageSize);
    },
    [operationsId]
  );

  const isAdministrative = initialData?.squadCategory === "ADMINISTRATIVE";
  const selectedUseOptions = isAdministrative ? useWorkerSquadOptionsLocal : useWorkerOperationsOptions;

  const sortedConfigs = [...(configs || [])].sort((a, b) => (a.shift || 0) - (b.shift || 0));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const initialOpt = {
          value: initialData.techLeaderId,
          label: initialData.techLeaderName || "Seleccionado",
        };
        setSelectedOption(initialOpt);
        reset({
          squadName: initialData.squadName || "",
          techLeaderId: initialData.techLeaderId || 0,
          description: initialData.description || "",
          operationsProjectConfigId: initialData.operationsProjectConfigId || null,
          squadCategory: initialData.squadCategory || "Normal",
        });
      } else {
        setSelectedOption(null);
        reset(defaultValues);
      }
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  if (!open) return null;

  const formId = "squad-form";
  const isEditing = !!initialData;

  return (
    <Modal
      title={isEditing ? "Editar Cuadrilla" : "Nueva Cuadrilla"}
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
            className="!bg-[#1A3673] !hover:bg-[#132856] text-white px-8"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              isEditing ? "Guardar Cambios" : "Crear Cuadrilla"
            )}
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Nombre de la Cuadrilla</label>
            <input
              placeholder="Ej: Cuadrilla Alfa"
              {...register("squadName")}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.squadName ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.squadName && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{errors.squadName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Descripción (Opcional)</label>
            <textarea
              placeholder="Ej: Equipo especializado en fibra óptica..."
              {...register("description")}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Líder Técnico de Cuadrilla</label>
            <Controller
              control={control}
              name="techLeaderId"
              render={({ field }) => (
                <SearchSelect
                  placeholder="Buscar líder por nombre..."
                  useOptions={selectedUseOptions}
                  value={selectedOption}
                  onChange={(opt) => {
                    setSelectedOption(opt);
                    field.onChange(opt ? Number(opt.value) : 0);
                  }}
                  className={errors.techLeaderId ? "border-red-500" : ""}
                />
              )}
            />
            {errors.techLeaderId && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{errors.techLeaderId.message}</p>
            )}
          </div>

          {sortedConfigs.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Configuración de Turno Asignado</label>
              <select
                {...register("operationsProjectConfigId", {
                  setValueAs: (v) => (v === "" || v === "null" ? null : Number(v)),
                })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-700 cursor-pointer"
              >
                <option value="null">-- Sin turno específico (Opcional) --</option>
                {sortedConfigs.map((c) => (
                  <option key={c.operationsProjectConfigId} value={c.operationsProjectConfigId}>
                    Turno {c.shift || 1} ({c.entryTime?.substring(0, 5)} - {c.departureTime?.substring(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
