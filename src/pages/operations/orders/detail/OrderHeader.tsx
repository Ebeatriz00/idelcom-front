import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import type { OperationsResponseDto } from "@/application/dtos/operations/operations/operations.dto";
import { ProgressDonut } from "../_shared/ProgressDonut";
import {
  Building2,
  ShieldCheck,
  Settings,
  FileText,
  TrendingUp,
} from "lucide-react";

type Props = {
  selectedOrder: OrdersResponseDto;
  opDetail?: OperationsResponseDto | null;
  isMobilePaneMode?: boolean;
  hasAdditionals: boolean;
  existingSsomaId?: number;
  onOpenAdditionals: (opporId: number) => void;
  onOpenSettings: (operationsId: number) => void;
  onOpenSsomaProcess: (
    operationsId: number,
    opporDesc: string,
    dates: { start?: string | null; end?: string | null },
    ssomaId?: number,
  ) => void;
  onOpenHistory: (operationsId: number, orderData: OrdersResponseDto) => void;
  canEditGeneralProjectAjustment: boolean;
  canEditSsomaTeam: boolean;
};

export function OrderHeader({
  selectedOrder,
  opDetail,
  isMobilePaneMode = false,
  hasAdditionals,
  existingSsomaId,
  onOpenAdditionals,
  onOpenSettings,
  onOpenSsomaProcess,
  onOpenHistory,
  canEditGeneralProjectAjustment,
  canEditSsomaTeam,
}: Props) {
  const progress = Math.min(100, Math.max(0, opDetail?.progressPercentage ?? 0));

  return (
    <div className="p-4 pb-0 sm:p-5 sm:pb-0 lg:p-6 lg:pb-0 xl:p-8 xl:pb-0">
      <div className="relative overflow-hidden rounded-lg border border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:p-6 xl:p-8">
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="shrink-0 rounded-lg border border-blue-100/50 bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700">
                N° {selectedOrder.opporNum}
              </span>

              {opDetail?.requeredSsoma && (
                <div className="flex items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1 text-orange-600">
                  <ShieldCheck className="size-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Requiere SSOMA
                  </span>
                </div>
              )}

            </div>

            {isMobilePaneMode && (
              <div className="flex min-w-0 items-start gap-2 text-slate-500">
                <Building2 className="size-4 shrink-0" />
                <p className="break-words text-[11px] font-bold uppercase tracking-wider leading-relaxed">
                  {selectedOrder.clientsName || "Cliente no especificado"}
                </p>
              </div>
            )}

            <h2
              className="max-w-5xl break-words text-xl font-black leading-tight tracking-tight text-[#0A1B3D] sm:text-2xl lg:text-3xl"
              title={selectedOrder.opporDesc}
            >
              {selectedOrder.opporDesc}
            </h2>

            {!isMobilePaneMode && (
              <div className="flex min-w-0 items-center gap-2 text-slate-500">
                <Building2 className="size-4 shrink-0" />
                <p className="truncate text-[11px] font-bold uppercase tracking-wider">
                  {selectedOrder.clientsName || "Cliente no especificado"}
                </p>
              </div>
            )}
          </div>

          {isMobilePaneMode ? (
            <div className="grid gap-4 xl:min-w-[260px] xl:shrink-0">
              <div className="rounded-lg border border-white bg-white/70 p-4 shadow-sm xl:border-slate-200 xl:bg-white/80">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  {opDetail?.operationStatusDesc && (
                    <div
                      className="flex min-h-8 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm"
                      style={
                        opDetail.stateColor
                          ? {
                              backgroundColor: `${opDetail.stateColor}15`,
                              color: opDetail.stateColor,
                              borderColor: `${opDetail.stateColor}40`,
                            }
                          : undefined
                      }
                    >
                      <div
                        className="size-2 rounded-full animate-pulse"
                        style={{ backgroundColor: opDetail.stateColor || "currentColor" }}
                      />
                      {opDetail.operationStatusDesc}
                    </div>
                  )}
                  <span className="text-sm font-black text-slate-950">{Math.round(progress)}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#1A3673] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Avance general
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {canEditGeneralProjectAjustment && (
                  <button
                    onClick={() => onOpenSettings(selectedOrder.operationsId!)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-100/50 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#0A1B3D] transition-all hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Settings className="size-3.5" />
                    Configuracion
                  </button>
                )}

                {selectedOrder.typeOppor === "1" && hasAdditionals && (
                  <button
                    onClick={() => onOpenAdditionals(selectedOrder.opporId!)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Ver Adicionales
                  </button>
                )}

                {opDetail?.requeredSsoma && (
                  <button
                    onClick={() =>
                      onOpenSsomaProcess(
                        selectedOrder.operationsId!,
                        selectedOrder.opporDesc || "",
                        { start: opDetail?.plannedStartDate, end: opDetail?.plannedEndDate },
                        existingSsomaId,
                      )
                    }
                    className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      canEditSsomaTeam
                        ? "bg-[#1A3673] text-white shadow-lg shadow-blue-900/10 hover:bg-[#132856] focus-visible:ring-offset-2"
                        : "border border-blue-100/50 bg-white text-[#0A1B3D] hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                    {canEditSsomaTeam ? "Asignar SSOMA" : "Ver SSOMA"}
                  </button>
                )}

                <button
                  onClick={() => onOpenHistory(selectedOrder.operationsId!, selectedOrder)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-100/50 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#0A1B3D] transition-all hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <TrendingUp className="size-3.5" />
                  Avance Operativo
                </button>

                {opDetail?.closurePdfFileUid && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || ""}/files/${opDetail.closurePdfFileUid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <FileText className="size-3.5" />
                    Descargar Acta
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8 shrink-0">
              <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                {opDetail?.operationStatusDesc && (
                  <div
                    className="flex w-36 shrink-0 items-center justify-center gap-2 rounded-lg border py-3 text-[10px] font-black uppercase tracking-widest shadow-sm"
                    style={
                      opDetail.stateColor
                        ? {
                            backgroundColor: `${opDetail.stateColor}15`,
                            color: opDetail.stateColor,
                            borderColor: `${opDetail.stateColor}40`,
                          }
                        : undefined
                    }
                  >
                    <div
                      className="size-2 rounded-full animate-pulse"
                      style={{ backgroundColor: opDetail.stateColor || "currentColor" }}
                    />
                    {opDetail.operationStatusDesc}
                  </div>
                )}
                <ProgressDonut progress={progress} size={64} strokeWidth={8} />
                {canEditGeneralProjectAjustment && (
                  <button
                    onClick={() => onOpenSettings(selectedOrder.operationsId!)}
                    className="grid size-11 place-items-center rounded-lg border border-transparent text-slate-400 transition-all hover:scale-105 hover:border-slate-200 hover:bg-slate-50 hover:text-[#1A3673] hover:shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title="Configuracion de Operaciones"
                    aria-label="Configuracion de operaciones"
                  >
                    <Settings className="size-5" />
                  </button>
                )}
              </div>
              <div className="grid min-w-[180px] grid-cols-1 gap-2">
              {selectedOrder.typeOppor === "1" && hasAdditionals && (
                <button
                  onClick={() => onOpenAdditionals(selectedOrder.opporId!)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Ver Adicionales
                </button>
              )}

              {opDetail?.requeredSsoma && (
                <button
                  onClick={() =>
                    onOpenSsomaProcess(
                      selectedOrder.operationsId!,
                      selectedOrder.opporDesc || "",
                      { start: opDetail?.plannedStartDate, end: opDetail?.plannedEndDate },
                      existingSsomaId,
                    )
                  }
                  className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    canEditSsomaTeam
                      ? "bg-[#1A3673] text-white shadow-lg shadow-blue-900/10 hover:bg-[#132856] focus-visible:ring-offset-2"
                      : "border border-blue-100/50 bg-white text-[#0A1B3D] hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck className="size-3.5" />
                  {canEditSsomaTeam ? "Asignar SSOMA" : "Ver SSOMA"}
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
                onClick={() => onOpenHistory(selectedOrder.operationsId!, selectedOrder)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-100/50 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#0A1B3D] transition-all hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <TrendingUp className="size-3.5" />
                Avance Operativo
              </button>

              {opDetail?.closurePdfFileUid && (
                <a
                  href={`${import.meta.env.VITE_API_URL || ""}/files/${opDetail.closurePdfFileUid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <FileText className="size-3.5" />
                  Descargar Acta
                </a>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
