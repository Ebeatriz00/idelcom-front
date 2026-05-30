import type { OperationsProjectConfigResponseDto } from "@/application/dtos/operations/configProject/configProject.dto";
import { Activity, Settings, Clock, ShieldAlert, Briefcase } from "lucide-react";

type Props = {
  configsSorted: OperationsProjectConfigResponseDto[];
  projectConfig: OperationsProjectConfigResponseDto | null;
  activeShiftTab: number;
  setActiveShiftTab: (index: number) => void;
  onOpenProjectConfig: (operationsId: number) => void;
  operationsId: number;
  canEditAppConfiguration: boolean;
};

export function ShiftConfigSection({
  configsSorted,
  projectConfig,
  activeShiftTab,
  setActiveShiftTab,
  onOpenProjectConfig,
  operationsId,
  canEditAppConfiguration,
}: Props) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:p-6">
      <div className="mb-5 grid gap-3 lg:mb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-2.5">
          <Activity className="size-3.5 shrink-0 text-slate-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            Horarios y Permisos
          </h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:flex lg:justify-end">
          {configsSorted && configsSorted.length > 1 && (
            <div className="min-w-0">
              <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400 sm:hidden">
                Turnos
              </p>
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-200/70 bg-slate-200/50 p-1">
                {configsSorted.map((c, index) => (
                  <button
                    key={c.operationsProjectConfigId ?? `shift-${index}`}
                    onClick={() => setActiveShiftTab(index)}
                    className={`min-h-9 flex-1 shrink-0 rounded-md px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex-none sm:min-h-8 sm:text-[8px] ${
                      activeShiftTab === index
                        ? "bg-white text-[#1A3673] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Turno {c.shift || index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onOpenProjectConfig(operationsId)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              canEditAppConfiguration
                ? "bg-[#1A3673] text-white hover:bg-[#132856] focus-visible:ring-offset-2"
                : "border border-blue-100 bg-white text-[#1A3673] hover:bg-slate-50"
            }`}
          >
            <Settings className="size-3" />
            {canEditAppConfiguration
              ? projectConfig ? "Actualizar" : "Configurar"
              : "Visualizar"}
          </button>
        </div>
      </div>

      {projectConfig ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-h-[124px] flex-col items-center rounded-lg border border-slate-100 bg-white p-4 text-center shadow-sm">
            <div className="mb-2 flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jornada</p>
            </div>
            <p className="mb-1 text-lg font-black leading-tight tracking-tight text-slate-900 sm:text-xl">
              {projectConfig.entryTime?.substring(0, 5)} - {projectConfig.departureTime?.substring(0, 5)}
            </p>
            <p className="text-[8px] font-bold uppercase text-slate-400">
              Tolerancia: {projectConfig.minutesTolerance} min
            </p>
          </div>

          <div className="flex min-h-[124px] flex-col items-center rounded-lg border border-slate-100 bg-white p-4 text-center shadow-sm">
            <div className="mb-2 flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-amber-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Controles</p>
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className={`rounded-lg px-2 py-1 text-center text-[8px] font-black uppercase ${projectConfig.isRequirePhoto ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                {projectConfig.isRequirePhoto ? "Foto Obligatoria" : "Sin Foto Personal"}
              </span>
              <span className={`rounded-lg px-2 py-1 text-center text-[8px] font-black uppercase ${projectConfig.isRequireAppAttendance ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                {projectConfig.isRequireAppAttendance ? "Asistencia en App" : "Sin Asistencia por App"}
              </span>
              <span className={`rounded-lg px-2 py-1 text-center text-[8px] font-black uppercase ${projectConfig.isRequireGroupPhoto ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                {projectConfig.isRequireGroupPhoto ? "Foto Grupal" : "Sin Foto Grupal"}
              </span>
              <span className={`rounded-lg px-2 py-1 text-center text-[8px] font-black uppercase ${projectConfig.allowDelay ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                {projectConfig.allowDelay ? "Admite Tolerancia" : "Sin Tolerancia"}
              </span>
            </div>
          </div>

          <div className="flex min-h-[124px] flex-col items-center rounded-lg border border-slate-100 bg-white p-4 text-center shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="mb-2 flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Horas Extra</p>
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className={`rounded-lg px-2 py-1 text-center text-[8px] font-black uppercase ${projectConfig.isRequireOvertime ? "border border-blue-100 bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-400"}`}>
                {projectConfig.isRequireOvertime ? "Habilitadas" : "Deshabilitadas"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[132px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-6 shadow-inner">
          <Settings className="mb-1.5 size-6 animate-pulse text-slate-200" />
          <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            Sin configuracion de horarios
          </p>
        </div>
      )}
    </div>
  );
}
