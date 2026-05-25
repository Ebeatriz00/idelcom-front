import { Modal, Button } from "@/layouts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ClipboardList, ListChecks, Users, Trash2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { OperationsWorkOrderResponseDto, OptionItem } from "@/application";
import { 
  cn, 
  useWorkOrderActivityList, 
  useCreateWorkOrderActivity, 
  useUpdateWorkOrderActivity,
  useDeleteWorkOrderActivity,
  useMeasurementUnitOptions, 
  useActivityComplexityOptions,
  useWorkOrderResponsibleList,
  useCreateWorkOrderResponsible,
  useWorkerOperationsOptions,
  useDeleteWorkOrderResponsible
} from "@/sharedKernel";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";

const schema = z.object({
  workOrderCode: z.string().optional().nullable(),
  workOrderName: z.string().min(1, "El nombre es requerido"),
  orderStatusId: z.number().default(1),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  needLogistics: z.boolean().default(false),
  needSsoma: z.boolean().default(false),
  needAttendance: z.boolean().default(false),
  progressPercentage: z.coerce.number().min(0).max(100).default(0),
  isAdministrative: z.boolean().default(false),
});

const activitySchema = z.object({
  activityName: z.string().min(1, "El nombre de la actividad es requerido"),
  measurementUnitId: z.number().min(1, "La unidad de medida es requerida"),
  complexityId: z.number().min(1, "La complejidad es requerida"),
  targetQuantity: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0"),
});

const responsibleSchema = z.object({
  workerId: z.number().min(1, "El trabajador es requerido"),
  isMain: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;
type ActivityFormValues = z.infer<typeof activitySchema>;
type ResponsibleFormValues = z.infer<typeof responsibleSchema>;

interface WorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  saving: boolean;
  initialData?: OperationsWorkOrderResponseDto | null;
}

const defaultValues: FormValues = {
  workOrderCode: "",
  workOrderName: "",
  orderStatusId: 1,
  startDate: "",
  endDate: "",
  location: "",
  needLogistics: false,
  needSsoma: false,
  needAttendance: false,
  progressPercentage: 0,
  isAdministrative: false,
};

type TabId = "general" | "activities" | "responsibles";

export function WorkOrderModal({
  open,
  onClose,
  onSubmit,
  saving,
  initialData,
}: WorkOrderModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [uomOption, setUomOption] = useState<OptionItem | null>(null);
  const [complexityOption, setComplexityOption] = useState<OptionItem | null>(null);
  const [workerOption, setWorkerOption] = useState<OptionItem | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [tempTargetQuantity, setTempTargetQuantity] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Actividades Logic
  const { data: activitiesData, isLoading: loadingActivities } = useWorkOrderActivityList(
    initialData?.workOrderId ?? 0,
    0,
    100
  );
  const { mutateAsync: createActivity, isPending: creatingActivity } = useCreateWorkOrderActivity();
  const { mutateAsync: updateActivity } = useUpdateWorkOrderActivity();
  const { mutateAsync: deleteActivity } = useDeleteWorkOrderActivity();

  const {
    register: registerAct,
    handleSubmit: handleSubmitAct,
    reset: resetAct,
    control: controlAct,
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityName: "",
      measurementUnitId: 0,
      complexityId: 0,
      targetQuantity: 0,
    },
  });

  // Responsables Logic
  const { data: responsiblesData, isLoading: loadingResponsibles } = useWorkOrderResponsibleList(
    0,
    100,
    ""
  );
  const { mutateAsync: createResponsible, isPending: creatingResponsible } = useCreateWorkOrderResponsible();
  const { mutateAsync: deleteResponsible } = useDeleteWorkOrderResponsible();

  const {
    handleSubmit: handleSubmitResp,
    reset: resetResp,
    control: controlResp,
    watch: watchResp,
  } = useForm<ResponsibleFormValues>({
    resolver: zodResolver(responsibleSchema),
    defaultValues: {
      workerId: 0,
      isMain: false,
    },
  });

  useEffect(() => {
    if (open) {
      setActiveTab("general");
      setUomOption(null);
      setComplexityOption(null);
      setWorkerOption(null);
      setEditingActivityId(null);
      if (initialData) {
        reset({
          workOrderCode: initialData.workOrderCode || "",
          workOrderName: initialData.workOrderName || "",
          orderStatusId: initialData.orderStatusId || 1,
          startDate: initialData.startDate?.split("T")[0] || "",
          endDate: initialData.endDate?.split("T")[0] || "",
          location: initialData.location || "",
          needLogistics: initialData.needLogistics || false,
          needSsoma: initialData.needSsoma || false,
          needAttendance: initialData.needAttendance || false,
          progressPercentage: initialData.progressPercentage || 0,
          isAdministrative: initialData.isAdministrative || false,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      needLogistics: true,
      needSsoma: true,
      needAttendance: true,
    });
  };

  const onAddActivity = async (data: ActivityFormValues) => {
    if (!initialData?.workOrderId) return;
    const resp = await createActivity({
      ...data,
      workOrderId: initialData.workOrderId,
    });
    if (resp.status === 1) {
      resetAct({
        activityName: "",
        measurementUnitId: 0,
        complexityId: 0,
        targetQuantity: 0,
      });
      setUomOption(null);
      setComplexityOption(null);
    }
  };

  const onUpdateTargetQuantity = async (act: any) => {
    const newQuantity = parseFloat(tempTargetQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      setEditingActivityId(null);
      return;
    }

    if (newQuantity === act.targetQuantity) {
      setEditingActivityId(null);
      return;
    }

    await updateActivity({
      activityId: act.activityId,
      workOrderId: act.workOrderId,
      activityName: act.activityName,
      measurementUnitId: act.measurementUnitId,
      complexityId: act.complexityId,
      targetQuantity: newQuantity,
    });
    setEditingActivityId(null);
  };

  const onDeleteActivity = async (activityId: number) => {
    if (!initialData?.workOrderId) return;
    await deleteActivity(activityId);
  };

  const onAddResponsible = async (data: ResponsibleFormValues) => {
    if (!initialData?.workOrderId) return;
    const resp = await createResponsible({
      ...data,
      workOrderId: initialData.workOrderId,
    });
    if (resp.status === 1) {
      resetResp({
        workerId: 0,
        isMain: false,
      });
      setWorkerOption(null);
    }
  };

  const formId = "work-order-form";
  const isEditing = !!initialData;
  
  if (!open) return null;

  const filteredResponsibles = responsiblesData?.items?.filter(r => r.workOrderId === initialData?.workOrderId) || [];
  const hasResponsibles = filteredResponsibles.length > 0;

  const tabs = [
    { id: "general" as const, label: "Información", icon: ClipboardList, disabled: false },
    { 
      id: "responsibles" as const, 
      label: "Responsables", 
      icon: Users, 
      disabled: !isEditing,
      requirement: "Crea la orden primero"
    },
    { 
      id: "activities" as const, 
      label: "Actividades", 
      icon: ListChecks, 
      disabled: !isEditing || !hasResponsibles,
      requirement: !isEditing ? "Crea la orden primero" : "Asigna responsables"
    },
  ];

  const getComplexityStyles = (name?: string) => {
    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("baja")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (lowerName.includes("media")) return "bg-amber-50 text-amber-600 border-amber-100";
    if (lowerName.includes("alta")) return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  return (
    <Modal
      title={isEditing ? "Gestión de Orden" : "Nueva Orden de Trabajo"}
      onClose={onClose}
      size="full"
      contentClassName="max-w-5xl !p-0 overflow-hidden rounded-[1.5rem]"
      footer={
        <div className="flex justify-end gap-3 w-full px-6 py-3 bg-white border-t border-slate-50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest"
          >
            Cerrar
          </Button>
          {activeTab === "general" && (
            <Button
              type="submit"
              form={formId}
              disabled={saving}
              className="!bg-[#1A3673] !hover:bg-[#132856] text-white px-8 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
            >
              {saving ? "Procesando..." : (isEditing ? "Actualizar" : "Inicializar")}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex h-[600px] bg-white">
        {/* SIDEBAR NAVEGACIÓN COMPACTO */}
        <aside className="w-56 border-r border-slate-50 bg-[#F8FAFC] p-4 flex flex-col gap-6">
          <div className="space-y-1 px-2">
            <h2 className="text-[9px] font-black text-[#1A3673] uppercase tracking-[0.2em]">Gestión</h2>
          </div>

          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative group">
                <Button
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id)}
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all justify-start h-auto",
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm border border-slate-100 translate-x-1"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50",
                    tab.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    activeTab === tab.id ? "bg-[#1A3673] text-white" : "bg-slate-200/50 text-slate-400"
                  )}>
                    <tab.icon className="size-3.5" />
                  </div>
                  {tab.label}
                </Button>
              </div>
            ))}
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO COMPACTA */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 max-w-4xl mx-auto w-full">
              
              {activeTab === "general" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <header className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Información General</h3>
                  </header>

                  <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción de la Orden</label>
                      <input
                        placeholder="Nombre descriptivo..."
                        {...register("workOrderName")}
                        className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white focus:border-blue-500/30"
                      />
                      {errors.workOrderName && <p className="text-[9px] text-rose-500 font-bold uppercase ml-1">{errors.workOrderName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inicio</label>
                        <input type="date" {...register("startDate")} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cierre Estimado</label>
                        <input type="date" {...register("endDate")} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación / Sede</label>
                      <input placeholder="Ubicación..." {...register("location")} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white" />
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                  <header>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Plan de Tareas</h3>
                  </header>

                  <form onSubmit={handleSubmitAct(onAddActivity)} className="bg-slate-900 p-5 rounded-[1.5rem] shadow-lg shadow-slate-100">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Actividad</label>
                        <input {...registerAct("activityName")} placeholder="Tarea..." className="w-full rounded-lg border-none bg-white/10 px-3 py-2 text-[11px] font-bold text-white placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UOM</label>
                        <Controller control={controlAct} name="measurementUnitId" render={({ field }) => (
                          <SearchSelect 
                            placeholder="UOM" 
                            useOptions={useMeasurementUnitOptions} 
                            value={uomOption} 
                            inputClassName="!bg-white/10 !border-none !py-2 !h-[34px]"
                            textClassName="!text-white"
                            className="text-white"
                            onChange={(opt) => { setUomOption(opt); field.onChange(opt ? Number(opt.value) : 0); }} 
                          />
                        )} />
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel</label>
                        <Controller control={controlAct} name="complexityId" render={({ field }) => (
                          <SearchSelect 
                            placeholder="Nivel" 
                            useOptions={useActivityComplexityOptions} 
                            value={complexityOption} 
                            inputClassName="!bg-white/10 !border-none !py-2 !h-[34px]"
                            textClassName="!text-white"
                            className="text-white"
                            onChange={(opt) => { setComplexityOption(opt); field.onChange(opt ? Number(opt.value) : 0); }} 
                          />
                        )} />
                      </div>
                      <div className="col-span-1 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta</label>
                        <input type="text" {...registerAct("targetQuantity")} onInput={(e) => { const target = e.target as HTMLInputElement; target.value = target.value.replace(/[^0-9.]/g, ''); }} className="w-full rounded-lg border-none bg-white/10 px-2 py-2 text-[11px] font-black text-white text-center focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <Button type="submit" disabled={creatingActivity} className="w-full !bg-[#1A3673] !hover:bg-[#132856] text-white rounded-lg h-[34px] text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-900/10">
                          {creatingActivity ? <Loader2 className="size-3 animate-spin mx-auto" /> : "Añadir"}
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {loadingActivities ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <div className="size-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cargando...</p>
                      </div>
                    ) : activitiesData?.items?.length ? (
                      activitiesData.items.map((act) => (
                        <div key={act.activityId} className="group flex items-center bg-white border border-slate-100 p-3 rounded-2xl hover:border-blue-100 transition-all">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="size-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                              <ListChecks className="size-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border", getComplexityStyles(act.complexityName))}>{act.complexityName}</span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase">{act.measurementUnitName}</span>
                              </div>
                              <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase truncate">{act.activityName}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 pl-4 border-l border-slate-50">
                            <div className="text-center min-w-[60px]">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Meta</p>
                              {editingActivityId === act.activityId ? (
                                <input autoFocus type="text" value={tempTargetQuantity} onChange={(e) => setTempTargetQuantity(e.target.value.replace(/[^0-9.]/g, ''))} onBlur={() => onUpdateTargetQuantity(act)} onKeyDown={(e) => { if (e.key === "Enter") onUpdateTargetQuantity(act); if (e.key === "Escape") setEditingActivityId(null); }} className="w-16 text-center text-xs font-black text-blue-600 bg-blue-50 rounded-lg py-0.5 border-1 border-blue-400 outline-none" />
                              ) : (
                                <span onClick={() => { setEditingActivityId(act.activityId); setTempTargetQuantity(act.targetQuantity.toString()); }} className="text-base font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">{act.targetQuantity}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onDeleteActivity(act.activityId)} className="size-8 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="size-3.5" /></Button>
                            </div>                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                        <ListChecks className="size-6 text-slate-200" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sin tareas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "responsibles" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col gap-6">
                  <header>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Equipo Operativo</h3>
                  </header>

                  <form onSubmit={handleSubmitResp(onAddResponsible)} className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-2xl flex gap-4 items-end">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black text-blue-700/50 uppercase tracking-widest ml-1">Personal</label>
                      <Controller control={controlResp} name="workerId" render={({ field }) => (
                        <SearchSelect placeholder="Nombre o documento..." useOptions={useWorkerOperationsOptions} value={workerOption} onChange={(opt) => { setWorkerOption(opt); field.onChange(opt ? Number(opt.value) : 0); }} />
                      )} />
                    </div>
                    <div className="flex items-center gap-2 h-[34px]">
                      <label className={cn("flex items-center justify-center gap-2 px-4 h-full rounded-lg border transition-all cursor-pointer", watchResp("isMain") ? "bg-amber-500 border-amber-400 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200")}>
                        <Star className={cn("size-3", watchResp("isMain") ? "fill-white" : "fill-none")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Líder</span>
                        <input type="checkbox" className="hidden" {...controlResp.register("isMain")} />
                      </label>
                      <Button type="submit" disabled={creatingResponsible} className="!bg-[#1A3673] !hover:bg-[#132856] text-white rounded-lg px-6 h-full text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-900/10">
                        {creatingResponsible ? <Loader2 className="size-3 animate-spin" /> : "Asignar"}
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {loadingResponsibles ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-pulse">
                        <div className="size-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cargando equipo...</p>
                      </div>
                    ) : filteredResponsibles.length ? (
                      filteredResponsibles.map((resp) => (
                        <div key={resp.workOrderResponsibleId} className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn("size-9 rounded-lg flex items-center justify-center shadow-sm", resp.isMain ? "bg-amber-100 text-amber-600 shadow-amber-50" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600")}>
                              <Users className="size-4.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">{resp.workerName || `ID: ${resp.workerId}`}</h4>
                                {resp.isMain && <span className="flex items-center gap-1 text-[7px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100"><Star className="size-2 fill-amber-600" /> Líder</span>}
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Colaborador</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteResponsible(resp.workOrderResponsibleId)} className="size-8 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="size-3.5" /></Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                        <Users className="size-6 text-slate-200" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sin asignar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Modal>
  );
}
