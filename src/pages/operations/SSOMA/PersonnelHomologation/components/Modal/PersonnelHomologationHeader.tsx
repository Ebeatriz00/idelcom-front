import { User, ClipboardCheck } from "lucide-react";
import { ProgressBar } from "@/layouts/presentation/ProgressBar";

type Props = {
  workerName?: string;
  isOperationScope: boolean;
  completedDocs: number;
  readyDocs: number;
  totalDocs: number;
};

export function PersonnelHomologationHeader({
  workerName,
  isOperationScope,
  completedDocs,
  readyDocs,
  totalDocs,
}: Props) {
  const progress = totalDocs > 0 ? Math.round(((completedDocs + readyDocs) / totalDocs) * 100) : 0;

  return (
    <div className="flex w-full flex-col gap-3 pb-2 pr-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
            <User className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {workerName || "Trabajador no especificado"}
            </h2>
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-500">Nueva homologación</span>
               <span className="size-1 rounded-full bg-slate-300" />
               <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-200">
                  {isOperationScope ? "Por Proyecto" : "General"}
               </div>
               <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
                  Borrador
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
           <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ClipboardCheck className="size-4 text-emerald-500" />
              <span>{completedDocs} guardados, {readyDocs} listos para guardar</span>
           </div>
           <ProgressBar 
              value={progress} 
              colorKey={progress === 100 ? "success" : "primary"} 
              widthClass="w-40 md:w-56" 
              heightClass="h-2"
           />
        </div>
      </div>
    </div>
  );
}
