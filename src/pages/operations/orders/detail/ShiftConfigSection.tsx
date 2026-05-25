import type { OperationsProjectConfigResponseDto } from "@/application/dtos/operations/configProject/configProject.dto";
import { Activity, Settings, Clock, ShieldAlert, Briefcase } from "lucide-react";

type Props = {
  configsSorted: OperationsProjectConfigResponseDto[];
  projectConfig: OperationsProjectConfigResponseDto | null;
  activeShiftTab: number;
  setActiveShiftTab: (index: number) => void;
  onOpenProjectConfig: (operationsId: number) => void;
  operationsId: number;
};

export function ShiftConfigSection({
  configsSorted,
  projectConfig,
  activeShiftTab,
  setActiveShiftTab,
  onOpenProjectConfig,
  operationsId,
}: Props) {
  return (
    <div className="rounded-xl bg-slate-50/50 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Activity className="size-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Horarios y Permisos</h3>
        </div>

        {/* SELECTOR DE TURNOS DINÁMICO */}
        {configsSorted && configsSorted.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg backdrop-blur-sm border border-slate-200/50 ml-4">
            {configsSorted.map((c, index) => (
              <button
                key={c.operationsProjectConfigId}
                onClick={() => setActiveShiftTab(index)}
                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${activeShiftTab === index ? 'bg-white text-[#1A3673] shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                T{c.shift || index + 1}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />
        <button
          onClick={() => onOpenProjectConfig(operationsId)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A3673] text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#132856] transition-all shadow-sm active:scale-95"
        >
          <Settings className="size-3" />
          {projectConfig ? "Actualizar" : "Configurar"}
        </button>
      </div>

      {projectConfig ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="size-3.5 text-emerald-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jornada</p>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tighter mb-1 leading-none">
              {projectConfig.entryTime?.substring(0, 5)} - {projectConfig.departureTime?.substring(0, 5)}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Tolerancia: {projectConfig.minutesTolerance} min
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="size-3.5 text-amber-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Controles</p>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase text-center ${projectConfig.isRequirePhoto ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                {projectConfig.isRequirePhoto ? "✓ Foto Obligatoria" : "× Sin Foto"}
              </span>
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase text-center ${projectConfig.allowDelay ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                {projectConfig.allowDelay ? "✓ Admite Tolerancia" : "× Sin Tolerancia"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="size-3.5 text-blue-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horas Extra</p>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase text-center ${projectConfig.isRequireOvertime ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                {projectConfig.isRequireOvertime ? "✓ Habilitadas" : "× Deshabilitadas"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-dashed border-gray-200 shadow-inner">
          <Settings className="size-6 text-slate-200 mb-1.5 animate-pulse" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
            Sin configuración de horarios
          </p>
        </div>
      )}
    </div>
  );
}
