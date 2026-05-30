import type { OperationsResponseDto } from "@/application/dtos/operations/operations/operations.dto";
import { Calendar, UserCheck } from "lucide-react";

type Props = {
  opDetail?: OperationsResponseDto | null;
};

export function ScheduleSection({ opDetail }: Props) {
  return (
    <div className="space-y-5 rounded-lg border border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:p-6">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="size-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            Cronograma
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
            <p className="mb-0.5 text-[8px] font-black uppercase text-slate-400">Inicio</p>
            <p className="text-xs font-bold text-slate-800">
              {opDetail?.plannedStartDate?.split("T")[0] || "-"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-3 text-left shadow-sm">
            <p className="mb-0.5 text-[8px] font-black uppercase text-slate-400">Cierre</p>
            <p className="text-xs font-bold text-slate-800">
              {opDetail?.plannedEndDate?.split("T")[0] || "-"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <UserCheck className="size-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            Responsables
          </h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm transition-colors hover:border-slate-200">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1A3673] text-[9px] font-black text-white">
              GP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black uppercase text-slate-400">Gerente de Proyecto</p>
              <p className="truncate text-xs font-bold text-slate-800">
                {opDetail?.projectManagerName || "Sin asignar"}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm transition-colors hover:border-slate-200">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1A3673] text-[9px] font-black text-white">
              SC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black uppercase text-slate-400">Supervisor de Calidad</p>
              <p className="truncate text-xs font-bold text-slate-800">
                {opDetail?.qualitySupervisorName || "Sin asignar"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
