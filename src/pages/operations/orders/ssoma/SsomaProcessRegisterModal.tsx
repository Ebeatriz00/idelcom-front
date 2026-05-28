import { Modal, Button } from "@/layouts";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useWorkerOperationsOptions, 
  useSsomaRoleSelect, 
  useOperationsTeamSsomaListByProcessId,
  useDeleteOperationsTeamSsoma,
  confirmAction,
  useConfigProjectById
} from "@/sharedKernel";
import { Plus, Trash2, Users, ShieldCheck, Loader2, RotateCcw } from "lucide-react";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { useEffect } from "react";

const teamMemberSchema = z.object({
  operationsTeamSsomaId: z.number().optional(),
  workerId: z.number().min(1, "Requerido"),
  ssomaRoleId: z.number().min(1, "Requerido"),
  isPrimary: z.boolean().default(false),
  startDate: z.string(),
  isActive: z.boolean().default(true),
  isReplacing: z.boolean().default(false),
  operationsProjectConfigId: z.number().optional().nullable(),
  _workerName: z.string().optional(), 
  _replacingWorkerName: z.string().optional(),
});

const schema = z.object({
  generalObservation: z.string().optional().or(z.literal("")),
  team: z.array(teamMemberSchema).min(1, "Asigne personal"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string, team: any[]) => void;
  saving: boolean;
  workOrderName: string;
  plannedDates: { start?: string | null; end?: string | null };
  ssomaProcessId?: number | null;
  operationsId: number;
  readOnly?: boolean;
}

export function SsomaProcessRegisterModal({ 
  open, 
  onClose, 
  onSubmit, 
  saving, 
  workOrderName, 
  plannedDates,
  ssomaProcessId,
  operationsId,
  readOnly = false
}: Props) {
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { generalObservation: "", team: [] },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "team" });
  const { data: roleOptions } = useSsomaRoleSelect(1, 1000, "");
  const { data: configs } = useConfigProjectById(operationsId);
  const { data: existingTeam, isLoading: loadingTeam } = useOperationsTeamSsomaListByProcessId(ssomaProcessId ?? 0);
  const { mutateAsync: deleteMember, isPending: deleting } = useDeleteOperationsTeamSsoma();

  const sortedConfigs = [...(configs || [])].sort((a, b) => (a.shift || 0) - (b.shift || 0));

  useEffect(() => {
    if (!open) {
      reset({ generalObservation: "", team: [] });
      return;
    }

    if (!ssomaProcessId) {
      setValue("team", []);
      return;
    }

    if (existingTeam && existingTeam.length > 0) {
      const mappedTeam = existingTeam
        .filter(item => {
          if (item.isActive) return true;
          return !item.replacedAssignmentId || item.replacedAssignmentId === 0;
        })
        .map(item => {
          const predecessor = existingTeam.find(t => t.replacedAssignmentId === item.operationsTeamSsomaId);
          const replacedName = predecessor?.workerName || "";

          return {
            operationsTeamSsomaId: item.operationsTeamSsomaId,
            workerId: item.workerId || 0,
            ssomaRoleId: item.ssomaRoleId,
            isPrimary: item.isPrimary,
            startDate: item.startDate.split("T")[0],
            isActive: item.isActive,
            isReplacing: false,
            operationsProjectConfigId: item.operationsProjectConfigId || null,
            _workerName: item.workerName,
            _replacingWorkerName: replacedName
          };
        });
      setValue("team", mappedTeam);
    } else if (existingTeam && existingTeam.length === 0) {
      setValue("team", []);
    }
  }, [open, existingTeam, setValue, ssomaProcessId]);

  if (!open) return null;

  const handleFormSubmit = (data: FormData) => {
    if (readOnly) return;

    const activeTeam = data.team.filter(member => member.isActive);
    onSubmit("", activeTeam);
    reset();
  };

  const handleStartReplacement = (index: number) => {
    const current = watch(`team.${index}`);
    const nameToStore = current._workerName || "";
    
    update(index, {
      ...current,
      workerId: 0,
      _replacingWorkerName: nameToStore,
      _workerName: "",
      isActive: true, 
      isReplacing: true 
    });
  };

  const handleDeleteMember = async (index: number) => {
    const member = watch(`team.${index}`);
    
    if (member.operationsTeamSsomaId) {
      const isConfirmed = await confirmAction({
        title: "¿Eliminar integrante?",
        text: "¿Estás seguro de que deseas eliminar a este integrante del equipo SSOMA?",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar"
      });
      
      if (isConfirmed) {
        await deleteMember(member.operationsTeamSsomaId);
      }
    } else {
      remove(index);
    }
  };

  const formId = "ssoma-process-form";

  return (
    <Modal
      onClose={onClose}
      title={readOnly ? "Visualización SSOMA" : "Equipo SSOMA"}
      size="3xl"
      footer={
        <div className="flex justify-end gap-3 w-full p-4 border-t bg-slate-50/50">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving || deleting}>
            {readOnly ? "Cerrar" : "Cancelar"}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              form={formId}
              disabled={saving || loadingTeam || deleting}
              className="!bg-[#1A3673] hover:!bg-[#132856] text-white px-8 font-black uppercase tracking-widest text-[10px]"
            >
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar Equipo"}
            </Button>
          )}
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 p-3">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="p-1.5 !bg-[#1A3673] rounded text-white shadow-sm">
            <ShieldCheck className="size-3" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tighter truncate leading-none">
              Asignación Operativa
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 truncate">{workOrderName}</p>
          </div>
          {!readOnly && (
          <button
            type="button"
            onClick={() => append({ 
              workerId: 0, 
              ssomaRoleId: 0, 
              isPrimary: fields.length === 0, 
              isActive: true,
              isReplacing: false,
              operationsProjectConfigId: null,
              startDate: plannedDates.start?.split("T")[0] || new Date().toISOString().split("T")[0] 
            })}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <Plus className="size-2.5" /> Añadir
          </button>
          )}
        </div>

        <div className="max-h-[450px] overflow-y-auto overflow-x-hidden space-y-4 px-2 pr-1 custom-scrollbar pt-2">
          {loadingTeam ? (
            <div className="py-8 flex flex-col items-center justify-center opacity-30">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : fields.length === 0 ? (
            <div className="py-10 border border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center bg-slate-50/20">
              <Users className="size-6 text-slate-200" />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sin personal</p>
            </div>
          ) : (
            fields.map((field, index) => {
              const isActive = watch(`team.${index}.isActive`);
              const isReplacing = watch(`team.${index}.isReplacing`);
              
              return (
                <div key={field.id} className={`group relative border rounded-lg p-3 transition-all ${
                  isActive 
                    ? isReplacing ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400' 
                    : 'bg-red-50/50 border-red-200 border-dashed'
                }`}>
                  {!isActive && (
                    <div className="absolute -top-2 left-3 flex items-center gap-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm z-10">
                      Puesto Libre / Reubicado
                    </div>
                  )}
                  {isReplacing && (
                    <div className="absolute -top-2 left-3 flex items-center gap-1 bg-amber-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm z-10">
                      Proceso de Reemplazo
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`flex-1 flex flex-col gap-1 ${!isActive ? 'opacity-70' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[220px]">
                          <Controller
                            control={control}
                            name={`team.${index}.workerId` as const}
                            render={({ field: { onChange, value } }) => {
                              const selectedOption = value 
                                ? { 
                                    value, 
                                    label: watch(`team.${index}._workerName`) || "" 
                                  } 
                                : null;

                              return (
                                <SearchSelect
                                  placeholder={isActive ? "Especialista..." : "Personal anterior..."}
                                  useOptions={useWorkerOperationsOptions}
                                  value={selectedOption}
                                  disabled={readOnly || !isActive}
                                  onChange={(opt) => {
                                    onChange(opt ? Number(opt.value) : 0);
                                    setValue(`team.${index}._workerName` as any, opt?.label || "");
                                  }}
                                />
                              );
                            }}
                          />
                        </div>
                        
                        {isReplacing || !isActive ? (
                          <div className="w-[210px] flex-shrink-0">
                            {isReplacing ? (
                              <div className="w-full h-[30px] bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-black uppercase rounded flex items-center justify-center gap-2 cursor-default">
                                <RotateCcw className="size-3" />
                                Reemplazo Pendiente
                              </div>
                            ) : readOnly ? (
                              <div className="w-full h-[30px] bg-slate-50 border border-slate-200 text-slate-400 text-[8px] font-black uppercase rounded flex items-center justify-center gap-2 cursor-default">
                                Puesto Libre
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartReplacement(index)}
                                className="w-full h-[30px] bg-amber-600 hover:bg-amber-700 text-white text-[8px] font-black uppercase rounded shadow-sm flex items-center justify-center gap-2 transition-all"
                              >
                                <RotateCcw className="size-3" />
                                Ejecutar Reemplazo
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="w-[110px] flex-shrink-0">
                              <select
                                {...register(`team.${index}.ssomaRoleId` as const, { valueAsNumber: true })}
                                disabled={readOnly || !isActive}
                                className="w-full text-[9px] font-bold p-1.5 border border-slate-200 rounded bg-slate-50/50 focus:bg-white outline-none h-[30px] cursor-pointer"
                              >
                                <option value={0}>Rol...</option>
                                {roleOptions?.items.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>

                            {sortedConfigs.length > 0 && (
                              <div className="w-[125px] flex-shrink-0">
                                <select
                                  {...register(`team.${index}.operationsProjectConfigId` as const, { 
                                    setValueAs: (v) => (v === "" || v === "null" || v === null ? null : Number(v)) 
                                  })}
                                  disabled={readOnly || !isActive}
                                  className="w-full text-[9px] font-bold p-1.5 border border-slate-200 rounded bg-white focus:bg-white outline-none h-[30px] cursor-pointer shadow-sm"
                                >
                                  <option value="null">Turno...</option>
                                  {sortedConfigs.map((c: any) => (
                                    <option key={c.operationsProjectConfigId} value={c.operationsProjectConfigId}>
                                      T{c.shift || 1} ({c.entryTime?.substring(0, 5)} - {c.departureTime?.substring(0, 5)})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            <div className="w-[60px] flex-shrink-0">
                              <label className={`flex items-center justify-center p-1 rounded border transition-all cursor-pointer h-[30px] w-full shadow-sm ${
                                watch(`team.${index}.isPrimary`) ? '!bg-[#1A3673] !border-[#1A3673] text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}>
                                <input 
                                  type="checkbox" 
                                  {...register(`team.${index}.isPrimary` as const)} 
                                  className="hidden" 
                                  disabled={readOnly || !isActive}
                                />
                                <span className="text-[8px] font-black uppercase">Líder</span>
                              </label>
                            </div>
                          </>
                        )}

                        {!readOnly && (
                          <div className="flex items-center gap-2 flex-shrink-0 border-l border-slate-100 pl-2 ml-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(index)}
                              disabled={deleting}
                              className="size-6 flex items-center justify-center bg-red-50 text-red-600 border border-red-100 rounded shadow-sm hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {watch(`team.${index}._replacingWorkerName`) && (
                        <p className="text-[7px] font-black text-amber-600 uppercase flex items-center gap-1 ml-1">
                          <RotateCcw className="size-2" />
                          Reemplazando a: {watch(`team.${index}._replacingWorkerName`)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {errors.team && (
          <p className="text-[8px] text-red-500 font-bold uppercase text-center py-1 bg-red-50 rounded border border-red-100">
            {errors.team.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
