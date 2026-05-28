import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import type { OperationsResponseDto } from "@/application/dtos/operations/operations/operations.dto";
import { ProgressDonut } from "../_shared/ProgressDonut";
import {
  ShieldCheck,
  Settings,
  History as HistoryIcon,
  FileText,
} from "lucide-react";

type Props = {
  selectedOrder: OrdersResponseDto;
  opDetail?: OperationsResponseDto | null;
  hasAdditionals: boolean;
  existingSsomaId?: number;
  onOpenAdditionals: (opporId: number) => void;
  onOpenSettings: (operationsId: number) => void;
  onOpenSsomaProcess: (operationsId: number, opporDesc: string, dates: { start?: string | null; end?: string | null }, ssomaId?: number) => void;
  onOpenHistory: (operationsId: number, orderData: OrdersResponseDto) => void;
};

export function OrderHeader({
  selectedOrder,
  opDetail,
  hasAdditionals,
  existingSsomaId,
  onOpenAdditionals,
  onOpenSettings,
  onOpenSsomaProcess,
  onOpenHistory,
}: Props) {
  return (
    <div className="p-8 pb-0">
      <div className="p-8 bg-slate-50/50 rounded-xl border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700 border border-blue-100/50">
                N° {selectedOrder.opporNum}
              </span>
              {opDetail?.requeredSsoma && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                  <ShieldCheck className="size-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Requiere SSOMA</span>
                </div>
              )}
              {selectedOrder.typeOppor === '1' && hasAdditionals && (
                <button 
                  onClick={() => onOpenAdditionals(selectedOrder.opporId!)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Ver Adicionales
                  </span>
                </button>
              )}
            </div>

            <h2 className="text-3xl font-black text-[#0A1B3D] tracking-tighter leading-none" title={selectedOrder.opporDesc}>
              {selectedOrder.opporDesc}
            </h2>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                <p className="text-[11px] font-bold uppercase tracking-wider">
                  {selectedOrder.clientsName || "Cliente no especificado"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10 shrink-0">
            <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-10">
              <div className="flex items-center gap-4">
                {opDetail?.operationStatusDesc && (
                  <div 
                    className="shrink-0 rounded-xl w-36 py-3 text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center justify-center gap-2"
                    style={opDetail.stateColor ? { 
                      backgroundColor: `${opDetail.stateColor}15`, 
                      color: opDetail.stateColor, 
                      borderColor: `${opDetail.stateColor}40` 
                    } : undefined}
                  >
                    <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: opDetail.stateColor || 'currentColor' }} />
                    {opDetail.operationStatusDesc}
                  </div>
                )}
                
                <div className="relative flex items-center justify-center">
                  <ProgressDonut progress={opDetail?.progressPercentage ?? 0} size={70} strokeWidth={8} />
                </div>
                <button
                  onClick={() => onOpenSettings(selectedOrder!.operationsId!)}
                  className="p-2.5 text-slate-400 hover:text-[#1A3673] hover:bg-slate-50 rounded-xl transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-slate-200 hover:shadow-sm"
                  title="Configuración de Operaciones"
                >
                  <Settings className="size-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[180px]">
              {opDetail?.requeredSsoma && (
                <button
                  onClick={() => onOpenSsomaProcess(
                    selectedOrder!.operationsId!,
                    selectedOrder!.opporDesc || "",
                    { start: opDetail?.plannedStartDate, end: opDetail?.plannedEndDate },
                    existingSsomaId
                  )}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A3673] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#132856] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                >
                  <ShieldCheck className="size-3.5" />
                  Procesos SSOMA
                </button>
              )}

              {opDetail?.closurePdfFileUid && (
                <a
                  href={`${import.meta.env.VITE_API_URL || ""}/files/${opDetail.closurePdfFileUid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                >
                  <FileText className="size-3.5" />
                  Descargar Acta
                </a>
              )}

              <button
                onClick={() => onOpenHistory(selectedOrder!.operationsId!)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-blue-100/50 bg-white text-[10px] font-black uppercase tracking-widest text-[#0A1B3D] hover:bg-slate-50 transition-all active:scale-95"
              >
                <HistoryIcon className="size-3.5" />
                Historial
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
