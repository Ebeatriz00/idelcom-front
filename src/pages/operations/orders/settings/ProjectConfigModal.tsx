import { Modal, Button } from "@/layouts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Clock, ShieldAlert, Briefcase, Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { OperationsProjectConfigResponseDto } from "@/application/dtos/operations/configProject/configProject.dto";

const schema = z.object({
  operationsProjectConfigId: z.number().optional().nullable(),
  shift: z.number().optional().nullable(),
  entryTime: z.string().min(1, "Hora de entrada requerida"),
  departureTime: z.string().min(1, "Hora de salida requerida"),
  allowDelay: z.boolean().default(false),
  minutesTolerance: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  beforeOfficialTime: z.string().min(1, "Hora anticipada requerida"),
  isRequirePhoto: z.boolean().default(false),
  isRequireOvertime: z.boolean().default(false),
  isRequireOvertimeApproval: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface ProjectConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  saving: boolean;
  initialData?: OperationsProjectConfigResponseDto | null;
  allConfigs?: OperationsProjectConfigResponseDto[];
  hasExistingConfig: boolean;
  readOnly?: boolean;
}

const defaultValues: FormValues = {
  operationsProjectConfigId: null,
  shift: null,
  entryTime: "08:00",
  departureTime: "17:00",
  allowDelay: true,
  minutesTolerance: 15,
  beforeOfficialTime: "07:30",
  isRequirePhoto: true,
  isRequireOvertime: false,
  isRequireOvertimeApproval: false,
};

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      times.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function ProjectConfigModal({
  open,
  onClose,
  onSubmit,
  saving,
  initialData,
  allConfigs = [],
  readOnly = false,
}: ProjectConfigModalProps) {

  const [selectedId, setSelectedId] = useState<number | "NEW" | null>(null);

  const sortedConfigs = useMemo(() =>
    [...allConfigs].sort((a, b) => (a.shift || 0) - (b.shift || 0))
    , [allConfigs]);

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const isOverTimeEnabled = watch("isRequireOvertime");
  const isAllowDelayEnabled = watch("allowDelay");
  const entryTimeVal = watch("entryTime");
  const departureTimeVal = watch("departureTime");
  const beforeOfficialTimeVal = watch("beforeOfficialTime");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSelectedId(initialData.operationsProjectConfigId);
      } else {
        setSelectedId("NEW");
      }
    } else {
      setSelectedId(null);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open || !selectedId) return;

    if (selectedId === "NEW") {
      reset({
        ...defaultValues,
      });
    } else {
      const config = sortedConfigs.find(c => c.operationsProjectConfigId === selectedId);
      if (config) {
        reset({
          operationsProjectConfigId: config.operationsProjectConfigId,
          shift: config.shift,
          entryTime: config.entryTime?.substring(0, 5) || "08:00",
          departureTime: config.departureTime?.substring(0, 5) || "17:00",
          allowDelay: !!(config.allowDelay ?? (config as any).AllowDelay),
          minutesTolerance: config.minutesTolerance ?? (config as any).MinutesTolerance ?? 0,
          beforeOfficialTime: config.beforeOfficialTime?.substring(0, 5) || "07:30",
          isRequirePhoto: !!(config.isRequirePhoto ?? (config as any).IsRequirePhoto),
          isRequireOvertime: !!(config.isRequireOvertime ?? (config as any).IsRequireOvertime),
          isRequireOvertimeApproval: !!(config.isRequireOvertimeApproval ?? (config as any).IsRequireOvertimeApproval),
        });
      }
    }
  }, [selectedId, sortedConfigs, open, reset]);

  if (!open) return null;

  const isEditMode = selectedId !== "NEW" && !!selectedId;
  const currentShift = isEditMode ? sortedConfigs.find(c => c.operationsProjectConfigId === selectedId)?.shift : null;
  const modalTitle = readOnly
    ? "Configuración de Aplicativo"
    : isEditMode
      ? "Editar Configuración"
      : "Crear Nueva Configuración";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>{modalTitle}</span>
          {isEditMode && currentShift && (
            <span className="ml-2 px-2 py-0.5 bg-[#1A3673]/10 text-[#1A3673] text-[9px] font-black rounded border border-[#1A3673]/20 uppercase tracking-widest">
              Turno {currentShift}
            </span>
          )}
        </div>
      }
      onClose={onClose}
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
            {readOnly ? "Cerrar" : "Cancelar"}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              form="project-config-form"
              disabled={saving}
              size="sm"
              style={{ backgroundColor: '#1A3673', color: 'white' }}
              className="px-6 rounded-lg font-black uppercase tracking-widest text-[9px] hover:opacity-90 transition-all shadow-sm shadow-blue-900/20"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : (isEditMode ? "Actualizar Turno" : "Guardar Nuevo")}
            </Button>
          )}
        </div>
      }
    >
      {sortedConfigs.length > 0 && (
        <div className="px-5 pt-5 flex items-center gap-2 flex-wrap border-b border-slate-100 pb-3 bg-slate-50/30">
          {sortedConfigs.map((cfg, idx) => (
            <button
              key={cfg.operationsProjectConfigId}
              type="button"
              onClick={() => setSelectedId(cfg.operationsProjectConfigId)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border font-black text-[9px] uppercase tracking-widest transition-all ${selectedId === cfg.operationsProjectConfigId
                ? 'bg-[#1A3673] border-[#1A3673] text-white shadow-md scale-105 z-10'
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
            >
              <Clock className={`size-3 ${selectedId === cfg.operationsProjectConfigId ? 'text-blue-200' : 'text-slate-300'}`} />
              Turno {cfg.shift || idx + 1}
            </button>
          ))}

          {!readOnly && (
            <button
              type="button"
              onClick={() => setSelectedId("NEW")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dashed font-black text-[9px] uppercase tracking-widest transition-all ${selectedId === "NEW"
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'}`}
            >
              <Plus className="size-3" />
              Nuevo Turno
            </button>
          )}
        </div>
      )}

      <form id="project-config-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-5">

        {/* SECCIÓN JORNADA */}
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="size-3.5 text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Jornada Laboral</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Hora de Entrada</label>
              <select {...register("entryTime")} disabled={readOnly} className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-700 outline-none focus:border-[#1A3673] transition-colors shadow-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default">
                {entryTimeVal && !TIME_OPTIONS.includes(entryTimeVal) && <option value={entryTimeVal}>{entryTimeVal}</option>}
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Hora de Salida</label>
              <select {...register("departureTime")} disabled={readOnly} className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-700 outline-none focus:border-[#1A3673] transition-colors shadow-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default">
                {departureTimeVal && !TIME_OPTIONS.includes(departureTimeVal) && <option value={departureTimeVal}>{departureTimeVal}</option>}
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tolerancia (Min)</label>
              <input
                type="number"
                {...register("minutesTolerance")}
                disabled={readOnly || !isAllowDelayEnabled}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-700 outline-none disabled:bg-slate-50 disabled:text-slate-300 shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tiempo Anticipado</label>
              <select {...register("beforeOfficialTime")} disabled={readOnly} className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-700 outline-none focus:border-[#1A3673] transition-colors shadow-sm bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default">
                {beforeOfficialTimeVal && !TIME_OPTIONS.includes(beforeOfficialTimeVal) && <option value={beforeOfficialTimeVal}>{beforeOfficialTimeVal}</option>}
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="size-3.5 text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Controles Administrativos</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all group">
              <input type="checkbox" {...register("allowDelay")} disabled={readOnly} className="size-4 rounded accent-[#1A3673] disabled:cursor-default" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">Habilitar Tolerancia</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all group">
              <input type="checkbox" {...register("isRequirePhoto")} disabled={readOnly} className="size-4 rounded accent-[#1A3673] disabled:cursor-default" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">Obligar Foto</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="size-3.5 text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tiempo Extra</h3>
          </div>

          <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${isOverTimeEnabled ? 'bg-[#1A3673] border-[#1A3673] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <input type="checkbox" {...register("isRequireOvertime")} disabled={readOnly} className="size-4 rounded accent-[#ffffff] disabled:cursor-default" />
            <span className="text-[10px] font-black uppercase tracking-widest">Habilitar Horas Extra</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

