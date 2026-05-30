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
  useConfigProjectById,
} from "@/sharedKernel";
import { Plus, Trash2, Users, ShieldCheck, Loader2, RotateCcw, CalendarDays, UserCheck } from "lucide-react";
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
  readOnly = false,
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
        .filter((item) => {
          if (item.isActive) return true;
          return !item.replacedAssignmentId || item.replacedAssignmentId === 0;
        })
        .map((item) => {
          const predecessor = existingTeam.find((t) => t.replacedAssignmentId === item.operationsTeamSsomaId);
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
            _replacingWorkerName: replacedName,
          };
        });
      setValue("team", mappedTeam);
    } else if (existingTeam && existingTeam.length === 0) {
      setValue("team", []);
    }
  }, [open, existingTeam, setValue, ssomaProcessId, reset]);

  if (!open) return null;

  const handleFormSubmit = (data: FormData) => {
    if (readOnly) return;

    const activeTeam = data.team.filter((member) => member.isActive);
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
      isReplacing: true,
    });
  };

  const handleDeleteMember = async (index: number) => {
    const member = watch(`team.${index}`);

    if (member.operationsTeamSsomaId) {
      const isConfirmed = await confirmAction({
        title: "¿Eliminar integrante?",
        text: "¿Estás seguro de que deseas eliminar a este integrante del equipo SSOMA?",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar",
      });

      if (isConfirmed) {
        await deleteMember(member.operationsTeamSsomaId);
      }
    } else {
      remove(index);
    }
  };

  const addMember = () => {
    append({
      workerId: 0,
      ssomaRoleId: 0,
      isPrimary: fields.length === 0,
      isActive: true,
      isReplacing: false,
      operationsProjectConfigId: null,
      startDate: plannedDates.start?.split("T")[0] || new Date().toISOString().split("T")[0],
    });
  };

  const formId = "ssoma-process-form";

  return (
    <Modal
      onClose={onClose}
      title={readOnly ? "Visualización SSOMA" : "Equipo SSOMA"}
      subtitle="Administra especialistas, roles, turnos y reemplazos del equipo SSOMA."
      size="full"
      contentClassName="max-w-5xl"
      bodyClassName="overflow-y-auto flex-1 min-h-0 bg-[#f6f8fb] px-3 py-3 sm:px-5 sm:py-4"
      footerClassName="flex shrink-0 items-center bg-white px-4 py-3 sm:px-5"
      footer={
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:justify-end sm:gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving || deleting}>
            {readOnly ? "Cerrar" : "Cancelar"}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              form={formId}
              disabled={saving || loadingTeam || deleting}
              className="!bg-[#1A3673] hover:!bg-[#132856] min-h-11 rounded-lg px-6 text-[10px] font-black uppercase tracking-widest text-white sm:px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Equipo"
              )}
            </Button>
          )}
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#1A3673] text-white shadow-sm">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-950">
                  Asignación operativa
                </h3>
                <p className="mt-1 break-words text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {workOrderName || "Operación sin descripción"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Users className="size-4 text-[#1A3673]" />
              {fields.length} integrante{fields.length === 1 ? "" : "s"}
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={addMember}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-800 shadow-sm transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="size-4" />
                Añadir integrante
              </button>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          {loadingTeam ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="size-7 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">Cargando equipo...</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <Users className="mb-2 size-8 text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sin personal asignado
              </p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addMember}
                  className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#1A3673] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  <Plus className="size-4" />
                  Añadir integrante
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const isActive = watch(`team.${index}.isActive`);
                const isReplacing = watch(`team.${index}.isReplacing`);
                const isPrimary = watch(`team.${index}.isPrimary`);
                const replacedName = watch(`team.${index}._replacingWorkerName`);

                return (
                  <article
                    key={field.id}
                    className={`relative rounded-lg border p-3 transition-all sm:p-4 ${
                      isActive
                        ? isReplacing
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white shadow-sm"
                        : "border-red-200 bg-red-50/60 border-dashed"
                    }`}
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
                          Integrante {index + 1}
                        </span>
                        {isPrimary && (
                          <span className="rounded-lg bg-[#1A3673] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                            Líder
                          </span>
                        )}
                        {!isActive && (
                          <span className="rounded-lg bg-red-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                            Puesto libre
                          </span>
                        )}
                        {isReplacing && (
                          <span className="rounded-lg bg-amber-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                            Reemplazo
                          </span>
                        )}
                      </div>
                    </div>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(index)}
                        disabled={deleting}
                        className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg border border-red-100 bg-white text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white disabled:opacity-50"
                        aria-label="Eliminar integrante"
                      >
                        {deleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    )}

                    <div className={`grid grid-cols-1 gap-3 ${!isActive ? "opacity-70" : ""} lg:grid-cols-[minmax(260px,1fr)_160px_180px_96px]`}>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <UserCheck className="size-3" />
                          Especialista
                        </label>
                        <Controller
                          control={control}
                          name={`team.${index}.workerId` as const}
                          render={({ field: { onChange, value } }) => {
                            const selectedOption = value
                              ? {
                                  value,
                                  label: watch(`team.${index}._workerName`) || "",
                                }
                              : null;

                            return (
                              <SearchSelect
                                placeholder={isActive ? "Buscar especialista..." : "Personal anterior..."}
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
                        <div className="space-y-1.5 lg:col-span-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Acción
                          </span>
                          {isReplacing ? (
                            <div className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-[10px] font-black uppercase tracking-widest text-amber-700">
                              <RotateCcw className="size-4" />
                              Reemplazo pendiente
                            </div>
                          ) : readOnly ? (
                            <div className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Puesto libre
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartReplacement(index)}
                              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-amber-700"
                            >
                              <RotateCcw className="size-4" />
                              Ejecutar reemplazo
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <label className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Rol
                            </span>
                            <select
                              {...register(`team.${index}.ssomaRoleId` as const, { valueAsNumber: true })}
                              disabled={readOnly || !isActive}
                              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:text-slate-400"
                            >
                              <option value={0}>Seleccionar rol</option>
                              {roleOptions?.items.map((o: any) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          {sortedConfigs.length > 0 ? (
                            <label className="space-y-1.5">
                              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                <CalendarDays className="size-3" />
                                Turno
                              </span>
                              <select
                                {...register(`team.${index}.operationsProjectConfigId` as const, {
                                  setValueAs: (v) => (v === "" || v === "null" || v === null ? null : Number(v)),
                                })}
                                disabled={readOnly || !isActive}
                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 disabled:text-slate-400"
                              >
                                <option value="null">Sin turno</option>
                                {sortedConfigs.map((c: any) => (
                                  <option key={c.operationsProjectConfigId} value={c.operationsProjectConfigId}>
                                    T{c.shift || 1} ({c.entryTime?.substring(0, 5)} - {c.departureTime?.substring(0, 5)})
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <div className="hidden lg:block" />
                          )}

                          <label className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Principal
                            </span>
                            <span
                              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 transition-all ${
                                isPrimary
                                  ? "border-[#1A3673] bg-[#1A3673] text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                {...register(`team.${index}.isPrimary` as const)}
                                className="hidden"
                                disabled={readOnly || !isActive}
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Líder
                              </span>
                            </span>
                          </label>
                        </>
                      )}
                    </div>

                    {replacedName && (
                      <p className="mt-3 flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-amber-700">
                        <RotateCcw className="size-3" />
                        Reemplazando a: {replacedName}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {errors.team && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-red-600">
            {errors.team.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
