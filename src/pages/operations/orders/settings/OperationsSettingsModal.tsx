import { Modal, Button } from "@/layouts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UserCheck, Briefcase, LayoutGrid, CalendarDays, Settings2, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OptionItem, OperationsResponseDto } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { useWorkerOperationsOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { useOperationsStatusSelect } from "@/sharedKernel/hooks/operations/operationsStatus/useOperationsStatus";
import { useSsomaOperationsRequirementList } from "@/sharedKernel/hooks/operations/ssomaOperationsRequirement/useSsomaOperationsRequirement";
import { useRequirementList } from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";

const schema = z.object({
  qualitySupervisorId: z.number().nullable().optional(),
  projectManagerId: z.number().nullable().optional(),
  requeredSsoma: z.boolean().default(false),
  plannedStartDate: z.string().nullable().optional(),
  actualStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
  actualEndDate: z.string().nullable().optional(),
  operationsStatusId: z.number().nullable().optional(),
  ssomaRequirementIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

interface OperationsSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  saving: boolean;
  initialData?: OperationsResponseDto | null;
}

const defaultValues: FormValues = {
  qualitySupervisorId: null,
  projectManagerId: null,
  requeredSsoma: false,
  plannedStartDate: "",
  actualStartDate: "",
  plannedEndDate: "",
  actualEndDate: "",
  operationsStatusId: null,
  ssomaRequirementIds: [],
};

const PAGE_SIZE = 8;

export function OperationsSettingsModal({
  open,
  onClose,
  onSubmit,
  saving,
  initialData,
}: OperationsSettingsModalProps) {
  const [qsOption, setQsOption] = useState<OptionItem | null>(null);
  const [pmOption, setPmOption] = useState<OptionItem | null>(null);
  const [statusOption, setStatusOption] = useState<OptionItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const requeredSsoma = watch("requeredSsoma");
  const { data: requirementsResult, isLoading: loadingRequirements } = useRequirementList(2, 1, 500);
  const { data: assignedResult, isLoading: loadingAssigned } = useSsomaOperationsRequirementList(
    open && initialData?.operationsId ? initialData.operationsId : 0, 1, 500
  );

  const requirements = requirementsResult?.items || [];
  const totalPages = Math.ceil(requirements.length / PAGE_SIZE);
  const paginatedRequirements = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return requirements.slice(start, start + PAGE_SIZE);
  }, [requirements, currentPage]);

  useEffect(() => {
    if (open && initialData) {
      if (initialData.qualitySupervisorId) {
        setQsOption({ value: initialData.qualitySupervisorId, label: initialData.qualitySupervisorName || "" });
      }
      if (initialData.projectManagerId) {
        setPmOption({ value: initialData.projectManagerId, label: initialData.projectManagerName || "" });
      }
      if (initialData.operationsStatusId) {
        setStatusOption({ value: initialData.operationsStatusId, label: initialData.operationStatusDesc || "" });
      }

      reset({
        ...defaultValues,
        qualitySupervisorId: initialData.qualitySupervisorId,
        projectManagerId: initialData.projectManagerId,
        requeredSsoma: !!initialData.requeredSsoma,
        plannedStartDate: initialData.plannedStartDate?.split("T")[0] || "",
        actualStartDate: initialData.actualStartDate?.split("T")[0] || "",
        plannedEndDate: initialData.plannedEndDate?.split("T")[0] || "",
        actualEndDate: initialData.actualEndDate?.split("T")[0] || "",
        operationsStatusId: initialData.operationsStatusId,
        ssomaRequirementIds: [], // Reiniciamos para cargar los nuevos
      });
      setCurrentPage(1);
    }
  }, [open, initialData, reset]);

  // Sincronización de requerimientos asignados: SOLO una vez al cargar o abrir
  const [hasInitializedRequirements, setHasInitializedRequirements] = useState(false);

  useEffect(() => {
    if (!open) {
      setHasInitializedRequirements(false);
      return;
    }

    if (open && assignedResult?.items && !hasInitializedRequirements && !loadingAssigned) {
      const ids = assignedResult.items.map(item => String(item.requirementId));
      setValue("ssomaRequirementIds", ids);
      setHasInitializedRequirements(true);
    }
  }, [open, assignedResult, setValue, hasInitializedRequirements, loadingAssigned]);

  const ssomaRequirementIds = watch("ssomaRequirementIds") || [];

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const currentIds = [...ssomaRequirementIds];
    if (checked) {
      if (!currentIds.includes(id)) {
        setValue("ssomaRequirementIds", [...currentIds, id]);
      }
    } else {
      setValue("ssomaRequirementIds", currentIds.filter(i => i !== id));
    }
  };

  if (!open) return null;

  const formId = "operations-settings-form";

  return (
    <Modal
      title="Ajustes de la Operación"
      onClose={onClose}
      size="full"
      contentClassName="max-w-6xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" form={formId} disabled={saving} className="!bg-[#1A3673] !hover:bg-[#132856] text-white px-10 rounded-xl font-black uppercase tracking-widest text-[10px]">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar Ajustes"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        
        {/* PARTE SUPERIOR: CONFIGURACIÓN GENERAL */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 !bg-[#1A3673] rounded-lg text-white shadow-lg shadow-slate-200"><Settings2 className="size-4" /></div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Configuración General</h3>
            </div>
            
            <label className={`flex items-center gap-4 px-6 py-2.5 rounded-xl border transition-all cursor-pointer ${requeredSsoma ? '!bg-[#1A3673] !border-[#1A3673] shadow-xl shadow-slate-200 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400'}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">Requiere SSOMA</span>
              <input type="checkbox" {...register("requeredSsoma")} className="size-5 accent-white cursor-pointer" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><UserCheck className="size-3" />Supervisor</label>
              <Controller control={control} name="qualitySupervisorId" render={({ field }) => (
                <SearchSelect placeholder="Buscar..." useOptions={useWorkerOperationsOptions} value={qsOption}
                  onChange={(opt) => { setQsOption(opt); field.onChange(opt ? Number(opt.value) : null); }} />
              )} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><Briefcase className="size-3" />Gerente de Proyecto</label>
              <Controller control={control} name="projectManagerId" render={({ field }) => (
                <SearchSelect placeholder="Buscar..." useOptions={useWorkerOperationsOptions} value={pmOption}
                  onChange={(opt) => { setPmOption(opt); field.onChange(opt ? Number(opt.value) : null); }} />
              )} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><LayoutGrid className="size-3" />Estado</label>
              <Controller control={control} name="operationsStatusId" render={({ field }) => (
                <SearchSelect placeholder="Seleccionar..." useOptions={useOperationsStatusSelect} value={statusOption}
                  onChange={(opt) => { setStatusOption(opt); field.onChange(opt ? Number(opt.value) : null); }} />
              )} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b pb-2">
                <CalendarDays className="size-3" /> Cronograma Planificado
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" {...register("plannedStartDate")} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                <input type="date" {...register("plannedEndDate")} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-emerald-50 pb-2">
                <CalendarDays className="size-3" /> Ejecución Real
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" {...register("actualStartDate")} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 p-3 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                <input type="date" {...register("actualEndDate")} className="w-full rounded-xl border border-emerald-100 bg-emerald-50/20 p-3 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR: MATRIZ DE REQUERIMIENTOS */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
             <ListChecks className="size-5 text-slate-400" />
             <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Matriz de Requerimientos</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Gestión de cumplimiento por operación</p>
             </div>
          </div>

          <div className="pt-2">
            {(loadingRequirements || loadingAssigned) ? (
              <div className="py-10 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="size-8 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando registros...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requirements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {paginatedRequirements.map((req) => (
                      <label key={req.requirementId} className="group flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-[#1A3673] hover:bg-white transition-all cursor-pointer shadow-sm">
                        <input 
                          type="checkbox" 
                          checked={ssomaRequirementIds.includes(String(req.requirementId))}
                          onChange={(e) => handleCheckboxChange(String(req.requirementId), e.target.checked)}
                          className="mt-1 size-4 accent-[#1A3673] cursor-pointer shrink-0" 
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-[#1A3673] line-clamp-1">{req.name}</span>
                          <span className="text-[9px] text-slate-400 line-clamp-2 font-medium leading-tight mt-0.5">{req.description || 'Sin descripción'}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No se encontraron requerimientos</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total: {requirements.length} registros</p>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#1A3673] disabled:opacity-20 transition-all shadow-sm">
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{currentPage} / {totalPages}</span>
                      <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#1A3673] disabled:opacity-20 transition-all shadow-sm">
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
