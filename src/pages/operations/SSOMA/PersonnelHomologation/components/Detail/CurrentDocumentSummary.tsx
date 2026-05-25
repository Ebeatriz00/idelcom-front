import { FileText, Calendar, ShieldCheck, ExternalLink, Archive, ShieldAlert } from "lucide-react";
import { useMemo } from "react";

type Props = {
  requirementName: string;
  operationName?: string;
  currentFileName?: string;
  currentFileUrl?: string;
  statusName?: string;
  expirationDate?: string;
  reviewDate?: string;
};

export function CurrentDocumentSummary({
  requirementName,
  operationName,
  currentFileName,
  currentFileUrl,
  statusName,
  expirationDate,
  reviewDate,
}: Props) {
  const isSensitive = useMemo(() => {
    const name = (requirementName || "").toUpperCase();
    return name.includes("MÉDICO") || name.includes("DNI") || name.includes("ANTECEDENTES") || name.includes("SALUD");
  }, [requirementName]);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all">
      {/* Background Decorator */}
      <div className="absolute right-0 top-0 -mr-8 -mt-8 size-32 rotate-12 bg-slate-50 opacity-50 transition-transform group-hover:scale-110" />
      
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-sm ring-1 ring-slate-200">
                <Archive className="size-5" />
             </div>
             <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Versión actual</span>
                <div className="flex flex-wrap items-center gap-2">
                   <h4 className="text-base font-bold text-slate-900">{requirementName}</h4>
                   {isSensitive && (
                     <span className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 ring-1 ring-inset ring-rose-200">
                        <ShieldAlert className="size-3" /> Confidencial
                     </span>
                   )}
                </div>
                {operationName && (
                  <p className="text-[11px] font-semibold text-slate-500">{operationName}</p>
                )}
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
             <ShieldCheck className="size-3" />
             {statusName || "Registrado"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50/50 p-4 ring-1 ring-slate-100 md:grid-cols-2">
           <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                 <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Archivo registrado</p>
                 <p className="mt-0.5 truncate text-xs font-semibold text-slate-700" title={currentFileName}>
                    {currentFileName || "Sin archivo especificado"}
                 </p>
                 {currentFileUrl && (
                   <a 
                     href={currentFileUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                   >
                     <ExternalLink className="size-3" />
                     Ver archivo actual
                   </a>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                    <Calendar className="size-3" /> Vencimiento
                 </div>
                 <p className="mt-0.5 text-xs font-bold text-slate-700">{expirationDate || "N/A"}</p>
              </div>
              
              {reviewDate && (
                <div className="flex flex-col">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                      <ShieldCheck className="size-3" /> Revisión
                   </div>
                   <p className="mt-0.5 text-xs font-bold text-slate-700">{reviewDate}</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
