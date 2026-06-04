import type { OperationsWorkOrderResponseDto, OptionItem } from "@/application";
import { Button, Modal } from "@/layouts";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import {
  cn,
  useActivityComplexityOptions,
  useCloneWorkOrderActivity,
  useCreateWorkOrderActivity,
  useCreateWorkOrderResponsible,
  useDeleteWorkOrderActivity,
  useDeleteWorkOrderResponsible,
  useMeasurementUnitOptions,
  useUpdateWorkOrderActivity,
  useWorkerOperationsOptions,
  useWorkOrderActivityList,
  useWorkOrderResponsibleList,
} from "@/sharedKernel";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  ClipboardList,
  ListChecks,
  Loader2,
  Plus,
  Star,
  Trash2,
  Users,
  Copy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as z from "zod";

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
type SubActivityDraft = {
  draftId: number;
  parentActivityId: number;
};

interface SubActivityDraftCardProps {
  draftId: number;
  onSubmit: (data: ActivityFormValues) => Promise<boolean>;
  onRemove: (draftId: number) => void;
  creatingActivity: boolean;
}

function SubActivityDraftCard({
  draftId,
  onSubmit,
  onRemove,
  creatingActivity,
}: SubActivityDraftCardProps) {
  const [uomOption, setUomOption] = useState<OptionItem | null>(null);
  const [complexityOption, setComplexityOption] = useState<OptionItem | null>(
    null,
  );

  const { register, handleSubmit, reset, control } =
    useForm<ActivityFormValues>({
      resolver: zodResolver(activitySchema),
      defaultValues: {
        activityName: "",
        measurementUnitId: 0,
        complexityId: 0,
        targetQuantity: 0,
      },
    });

  const submitDraft = async (data: ActivityFormValues) => {
    const success = await onSubmit(data);
    if (success) {
      reset({
        activityName: "",
        measurementUnitId: 0,
        complexityId: 0,
        targetQuantity: 0,
      });
      setUomOption(null);
      setComplexityOption(null);
      onRemove(draftId);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitDraft)}
      className="ml-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 sm:ml-10"
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-100 bg-white/80 px-3 py-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Borrador de subactividad
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onRemove(draftId)}
          className="flex size-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition-all hover:border-rose-200 hover:bg-rose-100 hover:text-rose-700"
          aria-label="Eliminar borrador"
          title="Eliminar borrador"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="space-y-1.5 md:col-span-2 xl:col-span-4">
          <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Actividad
          </label>
          <input
            {...register("activityName")}
            placeholder="Subactividad..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <div className="space-y-1.5 md:col-span-1 xl:col-span-3">
          <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
            UOM
          </label>
          <Controller
            control={control}
            name="measurementUnitId"
            render={({ field }) => (
              <SearchSelect
                placeholder="UOM"
                useOptions={useMeasurementUnitOptions}
                value={uomOption}
                inputClassName="!bg-white !border !border-slate-200 !py-2 !h-[34px]"
                textClassName="!text-slate-800"
                className="text-slate-800"
                onChange={(opt) => {
                  setUomOption(opt);
                  field.onChange(opt ? Number(opt.value) : 0);
                }}
              />
            )}
          />
        </div>
        <div className="space-y-1.5 md:col-span-1 xl:col-span-3">
          <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Nivel
          </label>
          <Controller
            control={control}
            name="complexityId"
            render={({ field }) => (
              <SearchSelect
                placeholder="Nivel"
                useOptions={useActivityComplexityOptions}
                value={complexityOption}
                inputClassName="!bg-white !border !border-slate-200 !py-2 !h-[34px]"
                textClassName="!text-slate-800"
                className="text-slate-800"
                onChange={(opt) => {
                  setComplexityOption(opt);
                  field.onChange(opt ? Number(opt.value) : 0);
                }}
              />
            )}
          />
        </div>
        <div className="space-y-1.5 md:col-span-1 xl:col-span-1">
          <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
            Meta
          </label>
          <input
            type="text"
            {...register("targetQuantity")}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9.]/g, "");
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-black text-slate-800 text-center outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <Button
            type="submit"
            disabled={creatingActivity}
            className="w-full !bg-emerald-600 text-white rounded-lg h-[34px] text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-200 hover:!bg-emerald-700"
          >
            {creatingActivity ? (
              <Loader2 className="size-3 animate-spin mx-auto" />
            ) : (
              "Crear"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

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
  const [complexityOption, setComplexityOption] = useState<OptionItem | null>(
    null,
  );
  const [workerOption, setWorkerOption] = useState<OptionItem | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null,
  );
  const [tempTargetQuantity, setTempTargetQuantity] = useState<string>("");
  const [subActivityDrafts, setSubActivityDrafts] = useState<
    SubActivityDraft[]
  >([]);
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(
    null,
  );
  const [cloningParentId, setCloningParentId] = useState<number | null>(null);
  const [cloneQuantity, setCloneQuantity] = useState<string>("1");
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

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
  const { data: activitiesData, isLoading: loadingActivities } =
    useWorkOrderActivityList(initialData?.workOrderId ?? 0, 0, 100);
  const { mutateAsync: createActivity, isPending: creatingActivity } =
    useCreateWorkOrderActivity();
  const { mutateAsync: updateActivity } = useUpdateWorkOrderActivity();
  const { mutateAsync: deleteActivity, isPending: isDeletingActivity } = useDeleteWorkOrderActivity();
  const { mutateAsync: cloneActivity, isPending: isCloning } = useCloneWorkOrderActivity();

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
  const { data: responsiblesData, isLoading: loadingResponsibles } =
    useWorkOrderResponsibleList(0, 100, "");
  const { mutateAsync: createResponsible, isPending: creatingResponsible } =
    useCreateWorkOrderResponsible();
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
      setSubActivityDrafts([]);
      setExpandedActivityId(null);
      setWorkerOption(null);
      setEditingActivityId(null);
      setSelectedActivities([]);
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

  const onAddSubActivity = async (
    parentActivityId: number,
    data: ActivityFormValues,
  ) => {
    if (!initialData?.workOrderId || !parentActivityId) return false;
    const resp = await createActivity({
      ...data,
      workOrderId: initialData.workOrderId,
      parentActivityId,
    });
    return resp.status === 1;
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
    
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará esta actividad y sus sub-actividades. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      await deleteActivity([activityId]);
    }
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

  const onCloneActivity = async (activityId: number) => {
    const qty = parseInt(cloneQuantity);
    if (isNaN(qty) || qty <= 0) return;
    await cloneActivity({ activityId, quantity: qty });
    setCloningParentId(null);
    setCloneQuantity("1");
  };

  const onDeleteBulkActivity = async () => {
    if (!selectedActivities.length) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminarán ${selectedActivities.length} actividad(es) y sus sub-actividades. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      const resp = await deleteActivity(selectedActivities);
      if (resp.status === 1) {
        setSelectedActivities([]);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allParentIds = groupedActivities.map(g => g.parent.activityId);
      setSelectedActivities(allParentIds);
    } else {
      setSelectedActivities([]);
    }
  };

  const handleSelectActivity = (activityId: number, checked: boolean) => {
    if (checked) {
      setSelectedActivities(prev => [...prev, activityId]);
    } else {
      setSelectedActivities(prev => prev.filter(id => id !== activityId));
    }
  };

  const formId = "work-order-form";
  const isEditing = !!initialData;

  const filteredResponsibles =
    responsiblesData?.items?.filter(
      (r) => r.workOrderId === initialData?.workOrderId,
    ) || [];
  const hasResponsibles = filteredResponsibles.length > 0;

  const groupedActivities = useMemo(() => {
    const items = activitiesData?.items || [];
    const parents = items.filter((item) => !item.parentActivityId);
    const childrenByParent = new Map<number, typeof items>();

    items.forEach((item) => {
      if (item.parentActivityId) {
        const current = childrenByParent.get(item.parentActivityId) || [];
        current.push(item);
        childrenByParent.set(item.parentActivityId, current);
      }
    });

    return parents.map((parent) => ({
      parent,
      children: childrenByParent.get(parent.activityId) || [],
    }));
  }, [activitiesData?.items]);

  const tabs = [
    {
      id: "general" as const,
      label: "Información",
      icon: ClipboardList,
      disabled: false,
    },
    {
      id: "responsibles" as const,
      label: "Responsables",
      icon: Users,
      disabled: !isEditing,
      requirement: "Crea la orden primero",
    },
    {
      id: "activities" as const,
      label: "Actividades",
      icon: ListChecks,
      disabled: !isEditing || !hasResponsibles,
      requirement: !isEditing ? "Crea la orden primero" : "Asigna responsables",
    },
  ];

  const getComplexityStyles = (name?: string) => {
    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("baja"))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (lowerName.includes("media"))
      return "bg-amber-50 text-amber-600 border-amber-100";
    if (lowerName.includes("alta"))
      return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  if (!open) return null;

  return (
    <Modal
      title={isEditing ? "Gestión de Orden" : "Nueva Orden de Trabajo"}
      onClose={onClose}
      size="full"
      contentClassName="max-w-5xl !p-0 overflow-hidden rounded-[1.5rem]"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 border-t border-slate-50 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="h-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 sm:w-auto"
          >
            Cerrar
          </Button>
          {activeTab === "general" && (
            <Button
              type="submit"
              form={formId}
              disabled={saving}
              className="h-10 rounded-xl bg-[#1A3673] px-8 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/10 transition-all active:scale-95 hover:bg-[#132856] sm:w-auto"
            >
              {saving
                ? "Procesando..."
                : isEditing
                  ? "Actualizar"
                  : "Inicializar"}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex max-h-[calc(100dvh-8rem)] min-h-[520px] flex-col bg-white lg:h-[600px] lg:flex-row">
        <aside className="border-b border-slate-50 bg-[#F8FAFC] p-3 lg:w-56 lg:border-b-0 lg:border-r lg:p-4">
          <div className="mb-3 hidden space-y-1 px-2 lg:block">
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A3673]">
              Gestión
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                className={cn(
                  "flex h-auto min-w-[138px] items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all lg:min-w-0 lg:w-full lg:justify-start",
                  activeTab === tab.id
                    ? "border border-slate-100 bg-white text-slate-900 shadow-sm lg:translate-x-1"
                    : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600",
                  tab.disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    activeTab === tab.id
                      ? "bg-[#1A3673] text-white"
                      : "bg-slate-200/50 text-slate-400",
                  )}
                >
                  <tab.icon className="size-3.5" />
                </div>
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
              {activeTab === "general" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <header className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      Información General
                    </h3>
                  </header>

                  <form
                    id={formId}
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Descripción de la Orden
                      </label>
                      <input
                        placeholder="Nombre descriptivo..."
                        {...register("workOrderName")}
                        className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white focus:border-blue-500/30"
                      />
                      {errors.workOrderName && (
                        <p className="text-[9px] text-rose-500 font-bold uppercase ml-1">
                          {errors.workOrderName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Inicio
                        </label>
                        <input
                          type="date"
                          {...register("startDate")}
                          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Cierre Estimado
                        </label>
                        <input
                          type="date"
                          {...register("endDate")}
                          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Ubicación / Sede
                      </label>
                      <input
                        placeholder="Ubicación..."
                        {...register("location")}
                        className="w-full rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all outline-none focus:bg-white"
                      />
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                  <header className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      Plan de Tareas
                    </h3>
                    {selectedActivities.length > 0 && (
                      <Button
                        type="button"
                        onClick={onDeleteBulkActivity}
                        disabled={isDeletingActivity}
                        className="h-8 rounded-lg bg-red-500 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 shadow-sm"
                      >
                        {isDeletingActivity ? <Loader2 className="size-3 animate-spin mr-1.5 inline-block" /> : <Trash2 className="size-3 mr-1.5 inline-block" />}
                        Eliminar ({selectedActivities.length})
                      </Button>
                    )}
                  </header>

                  <form
                    onSubmit={handleSubmitAct(onAddActivity)}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-12">
                      <div className="space-y-1.5 md:col-span-2 xl:col-span-4">
                        <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Actividad
                        </label>
                        <input
                          {...registerAct("activityName")}
                          placeholder="Tarea..."
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1 xl:col-span-3">
                        <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          UOM
                        </label>
                        <Controller
                          control={controlAct}
                          name="measurementUnitId"
                          render={({ field }) => (
                            <SearchSelect
                              placeholder="UOM"
                              useOptions={useMeasurementUnitOptions}
                              value={uomOption}
                              inputClassName="!bg-white !border !border-slate-200 !py-2 !h-[34px]"
                              textClassName="!text-slate-800"
                              className="text-slate-800"
                              onChange={(opt) => {
                                setUomOption(opt);
                                field.onChange(opt ? Number(opt.value) : 0);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1 xl:col-span-3">
                        <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Nivel
                        </label>
                        <Controller
                          control={controlAct}
                          name="complexityId"
                          render={({ field }) => (
                            <SearchSelect
                              placeholder="Nivel"
                              useOptions={useActivityComplexityOptions}
                              value={complexityOption}
                              inputClassName="!bg-white !border !border-slate-200 !py-2 !h-[34px]"
                              textClassName="!text-slate-800"
                              className="text-slate-800"
                              onChange={(opt) => {
                                setComplexityOption(opt);
                                field.onChange(opt ? Number(opt.value) : 0);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1 xl:col-span-1">
                        <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Meta
                        </label>
                        <input
                          type="text"
                          {...registerAct("targetQuantity")}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9.]/g, "");
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-black text-slate-800 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="md:col-span-1 xl:col-span-1">
                        <Button
                          type="submit"
                          disabled={creatingActivity}
                          className="w-full !bg-[#1A3673] !hover:bg-[#132856] text-white rounded-lg h-[34px] text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-900/10"
                        >
                          {creatingActivity ? (
                            <Loader2 className="size-3 animate-spin mx-auto" />
                          ) : (
                            "Añadir"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {loadingActivities ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <div className="size-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          Cargando...
                        </p>
                      </div>
                    ) : groupedActivities.length ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
                          <input
                            type="checkbox"
                            checked={selectedActivities.length > 0 && selectedActivities.length === groupedActivities.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-[#1A3673] focus:ring-[#1A3673] cursor-pointer"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Seleccionar Todas
                          </span>
                        </div>
                        {groupedActivities.map(({ parent, children }) => (
                          <div key={parent.activityId} className="space-y-2">
                            <div className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-blue-100 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedActivities.includes(parent.activityId)}
                                  onChange={(e) => handleSelectActivity(parent.activityId, e.target.checked)}
                                  className="size-4 rounded border-slate-300 text-[#1A3673] focus:ring-[#1A3673] cursor-pointer"
                                />
                                <button
                                type="button"
                                onClick={() =>
                                  setExpandedActivityId((current) =>
                                    current === parent.activityId
                                      ? null
                                      : parent.activityId,
                                  )
                                }
                                className={cn(
                                  "size-9 rounded-lg flex items-center justify-center transition-all",
                                  children.length
                                    ? expandedActivityId === parent.activityId
                                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                                      : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                    : "bg-amber-50 text-amber-600 ring-1 ring-amber-100 group-hover:bg-amber-100 group-hover:text-amber-700",
                                )}
                                aria-label={
                                  children.length
                                    ? "Ver subactividades"
                                    : "Sin subactividades"
                                }
                                title={
                                  children.length
                                    ? "Ver subactividades"
                                    : "Sin subactividades"
                                }
                              >
                                {children.length ? (
                                  <ListChecks className="size-4.5" />
                                ) : (
                                  <ClipboardList className="size-4.5" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span
                                    className={cn(
                                      "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                      getComplexityStyles(
                                        parent.complexityName,
                                      ),
                                    )}
                                  >
                                    {parent.complexityName}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-300 uppercase">
                                    {parent.measurementUnitName}
                                  </span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase truncate">
                                  {parent.activityName}
                                </h4>
                                {children.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedActivityId((current) =>
                                        current === parent.activityId
                                          ? null
                                          : parent.activityId,
                                      )
                                    }
                                    className={cn(
                                      "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest transition-all",
                                      expandedActivityId === parent.activityId
                                        ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                        : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800",
                                    )}
                                    aria-label="Ver subactividades"
                                    title="Ver subactividades"
                                  >
                                    <ListChecks className="size-3" />
                                    Subactividades
                                    <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] leading-none text-emerald-700">
                                      {children.length}
                                    </span>
                                    {expandedActivityId ===
                                    parent.activityId ? (
                                      <ChevronUp className="size-3" />
                                    ) : (
                                      <ChevronDown className="size-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                              <div className="min-w-[60px] text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                  Meta
                                </p>
                                {editingActivityId === parent.activityId ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={tempTargetQuantity}
                                    onChange={(e) =>
                                      setTempTargetQuantity(
                                        e.target.value.replace(/[^0-9.]/g, ""),
                                      )
                                    }
                                    onBlur={() =>
                                      onUpdateTargetQuantity(parent)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        onUpdateTargetQuantity(parent);
                                      if (e.key === "Escape")
                                        setEditingActivityId(null);
                                    }}
                                    className="w-16 text-center text-xs font-black text-blue-600 bg-blue-50 rounded-lg py-0.5 border-1 border-blue-400 outline-none"
                                  />
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditingActivityId(parent.activityId);
                                      setTempTargetQuantity(
                                        parent.targetQuantity.toString(),
                                      );
                                    }}
                                    className="text-base font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                                  >
                                    {parent.targetQuantity}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setSubActivityDrafts((current) => [
                                      ...current,
                                      {
                                        draftId: Date.now() + Math.random(),
                                        parentActivityId: parent.activityId,
                                      },
                                    ]);
                                  }}
                                  className="flex size-8 items-center justify-center rounded-lg text-emerald-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                                  aria-label="Agregar subactividad"
                                  title="Agregar subactividad"
                                >
                                  <CirclePlus
                                    className="size-4"
                                    strokeWidth={2.5}
                                  />
                                </Button>
                                {cloningParentId === parent.activityId ? (
                                  <div className="flex items-center gap-1.5 bg-blue-50/50 px-1 py-1 rounded border border-blue-100/50">
                                    <input
                                      type="text"
                                      value={cloneQuantity}
                                      onChange={(e) => setCloneQuantity(e.target.value.replace(/[^0-9]/g, ""))}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          onCloneActivity(parent.activityId);
                                        }
                                      }}
                                      className="h-[22px] w-8 text-center text-[10px] font-black text-blue-600 bg-white rounded-sm border border-blue-200 outline-none"
                                      placeholder="N°"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => onCloneActivity(parent.activityId)}
                                      disabled={isCloning}
                                      className="flex h-[22px] items-center justify-center gap-1 rounded bg-[#1A3673] px-2 text-[8px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#132856] disabled:opacity-50 shadow-sm"
                                    >
                                      {isCloning && <Loader2 className="size-2.5 animate-spin" />}
                                      Confirmar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCloningParentId(null)}
                                      className="flex h-[22px] w-[22px] items-center justify-center rounded bg-white border border-slate-200 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 shadow-sm"
                                      title="Cancelar"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCloningParentId(parent.activityId);
                                      setCloneQuantity("1");
                                    }}
                                    className="flex size-8 items-center justify-center rounded-lg text-blue-600 transition-all hover:bg-blue-50 hover:text-blue-700"
                                    title="Clonar actividad"
                                  >
                                    <Copy className="size-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    onDeleteActivity(parent.activityId)
                                  }
                                  className="flex size-8 items-center justify-center rounded-lg text-slate-200 transition-all hover:bg-rose-50 hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {subActivityDrafts
                            .filter(
                              (draft) =>
                                draft.parentActivityId === parent.activityId,
                            )
                            .map((draft) => (
                              <SubActivityDraftCard
                                key={draft.draftId}
                                draftId={draft.draftId}
                                creatingActivity={creatingActivity}
                                onSubmit={(data) =>
                                  onAddSubActivity(draft.parentActivityId, data)
                                }
                                onRemove={(draftId) => {
                                  setSubActivityDrafts((current) =>
                                    current.filter(
                                      (item) => item.draftId !== draftId,
                                    ),
                                  );
                                }}
                              />
                            ))}

                          {expandedActivityId === parent.activityId &&
                            children.length > 0 && (
                              <div className="space-y-2">
                                {children.map((child) => (
                                  <div
                                    key={child.activityId}
                                    className="ml-3 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-emerald-100 sm:ml-10 sm:flex-row sm:items-center"
                                  >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                      <div className="size-8 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                        <ListChecks className="size-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 flex items-center gap-2">
                                          <span
                                            className={cn(
                                              "rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest",
                                              getComplexityStyles(
                                                child.complexityName,
                                              ),
                                            )}
                                          >
                                            {child.complexityName}
                                          </span>
                                          <span className="text-[9px] font-bold uppercase text-slate-300">
                                            {child.measurementUnitName}
                                          </span>
                                        </div>
                                        <h4 className="truncate text-xs font-black uppercase tracking-tight text-slate-800">
                                          {child.activityName}
                                        </h4>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                         onClick={() => onAddActivity(child)}
                                        className="flex size-9 items-center justify-center rounded-lg border border-emerald-500 text-emerald-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                                        title="Añadir subactividad"
                                      >
                                        <Plus className="size-4" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          onDeleteActivity(child.activityId)
                                        }
                                        className="flex size-8 items-center justify-center rounded-lg text-slate-200 transition-all hover:bg-rose-50 hover:text-rose-500"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                        <ListChecks className="size-6 text-slate-200" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Sin tareas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "responsibles" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col gap-6">
                  <header>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      Equipo Operativo
                    </h3>
                  </header>

                  <form
                    onSubmit={handleSubmitResp(onAddResponsible)}
                    className="flex flex-col gap-4 rounded-2xl border border-blue-100/50 bg-blue-50/50 p-5 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black text-blue-700/50 uppercase tracking-widest ml-1">
                        Personal
                      </label>
                      <Controller
                        control={controlResp}
                        name="workerId"
                        render={({ field }) => (
                          <SearchSelect
                            placeholder="Nombre o documento..."
                            useOptions={useWorkerOperationsOptions}
                            value={workerOption}
                            onChange={(opt) => {
                              setWorkerOption(opt);
                              field.onChange(opt ? Number(opt.value) : 0);
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="flex h-[34px] items-center gap-2">
                      <label
                        className={cn(
                          "flex h-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 transition-all",
                          watchResp("isMain")
                            ? "border-amber-400 bg-amber-500 text-white"
                            : "border-slate-100 bg-white text-slate-400 hover:border-amber-200",
                        )}
                      >
                        <Star
                          className={cn(
                            "size-3",
                            watchResp("isMain") ? "fill-white" : "fill-none",
                          )}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Líder
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          {...controlResp.register("isMain")}
                        />
                      </label>
                      <Button
                        type="submit"
                        disabled={creatingResponsible}
                        className="h-full rounded-lg bg-[#1A3673] px-6 text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-md shadow-blue-900/10 hover:bg-[#132856]"
                      >
                        {creatingResponsible ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Asignar"
                        )}
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-2.5">
                    {loadingResponsibles ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 animate-pulse">
                        <div className="size-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          Cargando equipo...
                        </p>
                      </div>
                    ) : filteredResponsibles.length ? (
                      filteredResponsibles.map((resp) => (
                        <div
                          key={resp.workOrderResponsibleId}
                          className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 transition-all hover:border-blue-100"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={cn(
                                "size-9 rounded-lg flex items-center justify-center shadow-sm",
                                resp.isMain
                                  ? "bg-amber-100 text-amber-600 shadow-amber-50"
                                  : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600",
                              )}
                            >
                              <Users className="size-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h4 className="min-w-0 break-words text-xs font-black text-slate-800 tracking-tight uppercase">
                                  {resp.workerName || `ID: ${resp.workerId}`}
                                </h4>
                                {resp.isMain && (
                                  <span className="flex shrink-0 items-center gap-1 text-[7px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                    <Star className="size-2 fill-amber-600" />{" "}
                                    Líder
                                  </span>
                                )}
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                Colaborador
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              deleteResponsible(resp.workOrderResponsibleId)
                            }
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                        <Users className="size-6 text-slate-200" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Sin asignar
                        </p>
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
