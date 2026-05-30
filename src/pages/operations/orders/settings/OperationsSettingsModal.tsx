import { Modal, Button } from "@/layouts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  UserCheck,
  Briefcase,
  LayoutGrid,
  CalendarDays,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
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

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#1A3673] text-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-950">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function DateField({
  label,
  registration,
  tone = "default",
}: {
  label: string;
  registration: ReturnType<typeof useForm<FormValues>>["register"] extends (name: any) => infer R ? R : never;
  tone?: "default" | "success";
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <input
        type="date"
        {...registration}
        className={`min-h-11 w-full rounded-lg border p-3 text-sm font-bold outline-none transition-all focus:ring-2 ${
          tone === "success"
            ? "border-emerald-100 bg-emerald-50/40 text-emerald-800 focus:ring-emerald-500/20"
            : "border-slate-200 bg-white text-slate-700 focus:ring-blue-500/20"
        }`}
      />
    </label>
  );
}

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
  const ssomaRequirementIds = watch("ssomaRequirementIds") || [];
  const { data: requirementsResult, isLoading: loadingRequirements } = useRequirementList(2, 1, 500);
  const { data: assignedResult, isLoading: loadingAssigned } = useSsomaOperationsRequirementList(
    open && initialData?.operationsId ? initialData.operationsId : 0,
    1,
    500,
  );

  const requirements = requirementsResult?.items || [];
  const totalPages = Math.ceil(requirements.length / PAGE_SIZE);
  const paginatedRequirements = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return requirements.slice(start, start + PAGE_SIZE);
  }, [requirements, currentPage]);

  useEffect(() => {
    if (open && initialData) {
      setQsOption(
        initialData.qualitySupervisorId
          ? { value: initialData.qualitySupervisorId, label: initialData.qualitySupervisorName || "" }
          : null,
      );
      setPmOption(
        initialData.projectManagerId
          ? { value: initialData.projectManagerId, label: initialData.projectManagerName || "" }
          : null,
      );
      setStatusOption(
        initialData.operationsStatusId
          ? { value: initialData.operationsStatusId, label: initialData.operationStatusDesc || "" }
          : null,
      );

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
        ssomaRequirementIds: [],
      });
      setCurrentPage(1);
    }
  }, [open, initialData, reset]);

  const [hasInitializedRequirements, setHasInitializedRequirements] = useState(false);

  useEffect(() => {
    if (!open) {
      setHasInitializedRequirements(false);
      return;
    }

    if (open && assignedResult?.items && !hasInitializedRequirements && !loadingAssigned) {
      const ids = assignedResult.items.map((item) => String(item.requirementId));
      setValue("ssomaRequirementIds", ids);
      setHasInitializedRequirements(true);
    }
  }, [open, assignedResult, setValue, hasInitializedRequirements, loadingAssigned]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const currentIds = [...ssomaRequirementIds];
    if (checked) {
      if (!currentIds.includes(id)) {
        setValue("ssomaRequirementIds", [...currentIds, id]);
      }
    } else {
      setValue("ssomaRequirementIds", currentIds.filter((i) => i !== id));
    }
  };

  if (!open) return null;

  const formId = "operations-settings-form";

  return (
    <Modal
      title="Ajustes de la Operacion"
      subtitle="Actualiza responsables, fechas, estado y requisitos SSOMA."
      onClose={onClose}
      size="full"
      contentClassName="max-w-6xl"
      bodyClassName="overflow-y-auto flex-1 min-h-0 bg-[#f6f8fb] px-3 py-3 sm:px-5 sm:py-4"
      footerClassName="flex shrink-0 items-center bg-white px-4 py-3 sm:px-5"
      footer={
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:justify-end sm:gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={saving}
            className="!bg-[#1A3673] !hover:bg-[#132856] min-h-11 rounded-lg px-6 text-[10px] font-black uppercase tracking-widest text-white sm:px-10"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Ajustes"
            )}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <SectionHeader
              icon={<Settings2 className="size-4" />}
              title="Datos de operacion"
              description="Responsables y estado actual"
            />

            <label
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all sm:min-w-[220px] ${
                requeredSsoma
                  ? "border-[#1A3673] bg-[#1A3673] text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                Requiere SSOMA
              </span>
              <input
                type="checkbox"
                {...register("requeredSsoma")}
                className="size-5 cursor-pointer accent-white"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <UserCheck className="size-3" />
                Supervisor de Calidad
              </label>
              <Controller
                control={control}
                name="qualitySupervisorId"
                render={({ field }) => (
                  <SearchSelect
                    placeholder="Buscar supervisor..."
                    useOptions={useWorkerOperationsOptions}
                    value={qsOption}
                    onChange={(opt) => {
                      setQsOption(opt);
                      field.onChange(opt ? Number(opt.value) : null);
                    }}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Briefcase className="size-3" />
                Gerente de Proyecto
              </label>
              <Controller
                control={control}
                name="projectManagerId"
                render={({ field }) => (
                  <SearchSelect
                    placeholder="Buscar gerente..."
                    useOptions={useWorkerOperationsOptions}
                    value={pmOption}
                    onChange={(opt) => {
                      setPmOption(opt);
                      field.onChange(opt ? Number(opt.value) : null);
                    }}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <LayoutGrid className="size-3" />
                Estado
              </label>
              <Controller
                control={control}
                name="operationsStatusId"
                render={({ field }) => (
                  <SearchSelect
                    placeholder="Seleccionar estado..."
                    useOptions={useOperationsStatusSelect}
                    value={statusOption}
                    onChange={(opt) => {
                      setStatusOption(opt);
                      field.onChange(opt ? Number(opt.value) : null);
                    }}
                  />
                )}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <SectionHeader
              icon={<CalendarDays className="size-4" />}
              title="Cronograma planificado"
              description="Fechas acordadas de inicio y cierre"
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DateField label="Inicio planificado" registration={register("plannedStartDate")} />
              <DateField label="Cierre planificado" registration={register("plannedEndDate")} />
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <SectionHeader
              icon={<CalendarDays className="size-4" />}
              title="Ejecucion real"
              description="Fechas reales registradas en campo"
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DateField label="Inicio real" registration={register("actualStartDate")} tone="success" />
              <DateField label="Cierre real" registration={register("actualEndDate")} tone="success" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <SectionHeader
              icon={<ListChecks className="size-4" />}
              title="Requerimientos SSOMA"
              description="Selecciona los controles aplicables a la operacion"
            />

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <ShieldCheck className="size-3.5 text-[#1A3673]" />
              {ssomaRequirementIds.length} seleccionados
            </div>
          </div>

          {!requeredSsoma && (
            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
              Activa "Requiere SSOMA" si estos requerimientos deben aplicarse a la operacion.
            </div>
          )}

          {(loadingRequirements || loadingAssigned) ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-slate-400">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Sincronizando registros...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requirements.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {paginatedRequirements.map((req) => {
                    const checked = ssomaRequirementIds.includes(String(req.requirementId));

                    return (
                      <label
                        key={req.requirementId}
                        className={`group flex min-h-[76px] cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-sm transition-all ${
                          checked
                            ? "border-[#1A3673] bg-blue-50/70"
                            : "border-slate-100 bg-slate-50/60 hover:border-[#1A3673] hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => handleCheckboxChange(String(req.requirementId), e.target.checked)}
                          className="mt-1 size-4 shrink-0 cursor-pointer accent-[#1A3673]"
                        />
                        <div className="flex min-w-0 flex-col">
                          <span className="line-clamp-2 text-[10px] font-black uppercase leading-tight tracking-tight text-slate-800 group-hover:text-[#1A3673]">
                            {req.name}
                          </span>
                          <span className="mt-1 line-clamp-2 text-[9px] font-medium leading-tight text-slate-400">
                            {req.description || "Sin descripcion"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    No se encontraron requerimientos
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Total: {requirements.length} registros
                  </p>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:text-[#1A3673] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="min-w-[64px] text-center text-[10px] font-black uppercase tracking-tighter text-slate-900">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:text-[#1A3673] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </form>
    </Modal>
  );
}
