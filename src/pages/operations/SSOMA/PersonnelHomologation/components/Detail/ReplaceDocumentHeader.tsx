import { User, ClipboardCheck, History, AlertCircle } from "lucide-react";

type Props = {
  workerName?: string;
  itemsCount: number;
};

export function ReplaceDocumentHeader({ workerName, itemsCount }: Props) {
  return (
    <div className="flex w-full flex-col gap-3 pb-2 pr-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-100">
            <History className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Reemplazar documentación
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <User className="size-3.5" />
                {workerName || "Trabajador no especificado"}
              </div>
              <span className="size-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
                Reemplazo pendiente
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-2">
          <ClipboardCheck className="size-5 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700">
              {itemsCount} {itemsCount === 1 ? 'Documento' : 'Documentos'}
            </span>
            <span className="text-[10px] font-medium text-blue-600/80 uppercase tracking-tight">Acción de reemplazo</span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100">
        <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
        <p>Estás a punto de sustituir un documento registrado. Esta acción es trazable y el archivo anterior será reemplazado por la nueva versión en la homologación actual.</p>
      </div>
    </div>
  );
}
