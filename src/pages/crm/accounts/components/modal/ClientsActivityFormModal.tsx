import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Modal } from "@/layouts"; 
import { useClientsActivityMutations } from "@/sharedKernel";
import { RHFSearchSelect } from "./form/RHFSearchSelect"; 
import { useAuth } from "@/stores/auth"; 
import { idToOption } from "./form/clients.schema"; 
import { useActivityTypeOptions, useActivityStateOptions } from "@/sharedKernel"; 

interface Props {
  open: boolean;
  onClose: () => void;
  clientsId: number;
  onSuccess?: () => void;
}

interface FormValues {
  activityTypeId: number;
  activityStateId: number;
  description: string;
  finishDate: string; 
}

export function ClientsActivityFormModal({ open, onClose, clientsId, onSuccess }: Props) {
  const workerIdStr = useAuth((s) => s.workerId);
  const currentWorkerId = Number(workerIdStr);

  const { createMut } = useClientsActivityMutations(clientsId);
  
  const { 
    control, 
    handleSubmit, 
    register, 
    reset, 
    watch, 
    setValue, 
    formState: { isValid }
  } = useForm<FormValues>({
      defaultValues: { 
          description: "", 
          finishDate: "",
          activityTypeId: 0,
          activityStateId: 0
      }
  });

  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; 
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    if (open) {
      reset({
        description: "",
        finishDate: getLocalISOTime(),
        activityTypeId: 0, 
        activityStateId: 0
      });
    }
  }, [open, reset]);

  const activityTypeId = watch("activityTypeId");
  const activityStateId = watch("activityStateId");

  const { data: typeResp } = useActivityTypeOptions?.() ?? { data: { items: [] } };
  const typeOptions = typeResp?.items ?? [];

  const { data: stateResp } = useActivityStateOptions?.() ?? { data: { items: [] } };
  const stateOptions = stateResp?.items ?? [];

  const onSubmit = async (data: FormValues) => {
    if (!currentWorkerId) return;

    try {
        await createMut.mutateAsync({
            clientsId,
            workerId: currentWorkerId,
            activityTypeId: data.activityTypeId,
            activityStateId: data.activityStateId,
            description: data.description,
            finishDate: data.finishDate, 
        });
        
        if (onSuccess) onSuccess();
        onClose();
    } catch (error) {
        console.error("Error al crear actividad", error);
    }
  };

  if (!open) return null;

  return (
    <Modal title="Nueva Actividad" size="md" onClose={onClose} 
      footer={
        <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 text-sm hover:bg-gray-100 rounded">Cancelar</button>
            <button 
                onClick={handleSubmit(onSubmit)} 
                disabled={!isValid || createMut.isPending || !currentWorkerId}
                className="bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
                {createMut.isPending ? "Guardando..." : "Guardar Actividad"}
            </button>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        <RHFSearchSelect
            control={control}
            name="activityTypeId"
            label="Tipo de Actividad"
            required
            useOptions={() => ({ data: typeResp, isLoading: false })} 
            value={
                activityTypeId > 0
                ? (typeOptions.find(o => Number(o.value) === activityTypeId) ?? idToOption(activityTypeId))
                : null 
            }
            onChangeValue={(opt) => {
                setValue("activityTypeId", opt ? Number(opt.value) : 0, { shouldValidate: true });
            }} 
            placeholder="Seleccione tipo..."
        />

         <RHFSearchSelect
            control={control}
            name="activityStateId"
            label="Estado"
            required
            useOptions={() => ({ data: stateResp, isLoading: false })}
            value={
                activityStateId > 0
                ? (stateOptions.find(o => Number(o.value) === activityStateId) ?? idToOption(activityStateId))
                : null
            }
            onChangeValue={(opt) => {
                setValue("activityStateId", opt ? Number(opt.value) : 0, { shouldValidate: true });
            }}
            placeholder="Seleccione estado..."
        />

        <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-tight">Fecha y Hora *</label>
            <input 
                type="datetime-local" 
                {...register("finishDate", { required: true })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
        </div>

        <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-tight">Nota / Descripción *</label>
            <textarea 
                rows={3}
                {...register("description", { required: true })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Detalle de la interacción..."
            />
        </div>
      </div>
    </Modal>
  );
}