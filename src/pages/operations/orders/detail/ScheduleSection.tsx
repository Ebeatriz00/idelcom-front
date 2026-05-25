import type { OperationsResponseDto } from "@/application/dtos/operations/operations/operations.dto";
import { Calendar, UserCheck } from "lucide-react";

type Props = {
  opDetail?: OperationsResponseDto | null;
};

export function ScheduleSection({ opDetail }: Props) {
  return (
    <div className="space-y-6 bg-slate-50/50 rounded-xl border border-gray-100 p-6">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Cronograma</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Inicio</p>
            <p className="text-xs font-bold text-slate-800">
              {opDetail?.plannedStartDate?.split("T")[0] || "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm text-left">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Cierre</p>
            <p className="text-xs font-bold text-slate-800">
              {opDetail?.plannedEndDate?.split("T")[0] || "—"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="size-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Responsables</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
            <div className="size-8 rounded-lg bg-[#1A3673] flex items-center justify-center text-[9px] font-black text-white shrink-0">GP</div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black text-slate-400 uppercase">Gerente de Proyecto</p>
              <p className="text-xs font-bold text-slate-800 truncate">{opDetail?.projectManagerName || "Sin asignar"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
            <div className="size-8 rounded-lg bg-[#1A3673] flex items-center justify-center text-[9px] font-black text-white shrink-0">SC</div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black text-slate-400 uppercase">Supervisor de Calidad</p>
              <p className="text-xs font-bold text-slate-800 truncate">{opDetail?.qualitySupervisorName || "Sin asignar"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
