import type { OpportunitiesResponseDto } from "@/application";
import { statusToBool } from "@/sharedKernel";
import {
  CircleFadingArrowUp,
  FileCheck,
  FileText,
  FolderSearch2,
  MessageCircle,
  MessageSquareDot,
  Pencil,
  Power,
  Sprout,
} from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { opportunitiesGuards } from "../../utils/guards";
import { getObsQuoKind } from "./opportunityGuards";

type OpporActionsCellProps = {
  oppor: OpportunitiesResponseDto;
  canUseViewComment: boolean;
  canUseFileOption: boolean;
  canEditOppor: boolean;
  canEditStatusOppor: boolean;
  existQuo: number;
  obsQuo: number;
  obsQuoResolved: number;
  preSalesDelivered: number;
  typeObsEconomic: number;
  stateOpporDesc: string;
  onOpenComments: (row: OpportunitiesResponseDto) => void;

  onOpenFiles: (row: OpportunitiesResponseDto) => void;
  onOpenViability: (row: OpportunitiesResponseDto) => void;
  onEdit: (row: OpportunitiesResponseDto) => void;
  onToggleStatus: (row: OpportunitiesResponseDto) => void;
  onOpenDeliverables: (row: OpportunitiesResponseDto) => void;
  onOpenQuotation: (linkToken: string) => void;
  onOpenQuotationVer: (row: OpportunitiesResponseDto) => void;
  openMenuFor: string | null;
  setOpenMenuFor: (id: string | null) => void;
};

type Pos = { top: number; left: number };

const MENU_W = 192;
const GAP = 8;

export function OpporActionsCell({
  oppor,
  canUseViewComment,
  canUseFileOption,
  canEditOppor,
  canEditStatusOppor,
  existQuo,
  obsQuo,
  obsQuoResolved,
  typeObsEconomic,
  preSalesDelivered,
  stateOpporDesc,
  onOpenComments,
  onOpenFiles,
  onOpenViability,
  onEdit,
  onToggleStatus,
  onOpenQuotationVer,
  onOpenDeliverables,
  onOpenQuotation,
  openMenuFor,
  setOpenMenuFor,
}: OpporActionsCellProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0 });

  const active = statusToBool(oppor.status);
  const inUse = opportunitiesGuards.isInUse(oppor);
  const _canToggle = opportunitiesGuards.canToggle(oppor);

  const unread = oppor.unreadCommentsCount ?? 0;
  const hasUnread = unread > 0;

  const isOpen = openMenuFor === oppor.linkToken;

  const close = () => setOpenMenuFor(null);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!oppor.linkToken) return close();
    setOpenMenuFor(isOpen ? null : oppor.linkToken);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const btn = btnRef.current;
      if (!btn) return;

      const r = btn.getBoundingClientRect();
      let top = r.bottom + GAP;
      let left = r.right - MENU_W;

      const maxLeft = window.innerWidth - MENU_W - GAP;
      if (left > maxLeft) left = maxLeft;
      if (left < GAP) left = GAP;

      const estimatedMenuH = menuRef.current?.offsetHeight ?? 220;
      const maxTop = window.innerHeight - estimatedMenuH - GAP;
      if (top > maxTop) top = r.top - GAP - estimatedMenuH;

      if (top < GAP) top = GAP;

      setPos({ top, left });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;

      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const menu =
    isOpen && stateOpporDesc ? (
      <div
        ref={menuRef}
        className="
        fixed z-[9999]
        rounded-md border border-slate-200
        bg-white shadow-lg py-1
      "
        style={{ width: MENU_W, top: pos.top, left: pos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onOpenDeliverables(oppor);
            close();
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-100 text-orange-600"
        >
          <FileCheck className="size-4" />
          <span>Gestionar entregables</span>
        </button>

        {canEditOppor && (
          <button
            onClick={() => {
              onEdit(oppor);
              close();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-100 text-indigo-600"
          >
            <Pencil className="size-4" />
            <span>Editar oportunidad</span>
          </button>
        )}

        {canEditStatusOppor && (
          <div className="my-1 border-t border-slate-200" />
        )}

        {canEditStatusOppor && (
          <button
            onClick={() => {
              if (_canToggle) onToggleStatus(oppor);
              close();
            }}
            disabled={!_canToggle}
            className={`
            flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm
            hover:bg-slate-100
            ${active ? "text-emerald-600" : "text-slate-500"}
            ${!_canToggle ? "opacity-50 cursor-not-allowed" : ""}
          `}
            title={
              _canToggle
                ? active
                  ? "Desactivar"
                  : "Activar"
                : inUse
                  ? "No se puede desactivar: en uso"
                  : "Acción no permitida"
            }
          >
            <Power className="size-4" />
            <span>
              {_canToggle
                ? active
                  ? "Desactivar"
                  : "Activar"
                : inUse
                  ? "No se puede desactivar (en uso)"
                  : "Acción no permitida"}
            </span>
          </button>
        )}
      </div>
    ) : null;

  // ✅ Reglas reales (dependen de tipo obs económico)
  const hasQuotation = existQuo > 0;

  const obsKind = getObsQuoKind({ ...oppor, typeObsEconomic });

  // Obs de cotización
  const hasObsPending = obsQuo > 0;
  const hasObsResolved = obsQuoResolved > 0;

  // 👁️ Ver cotización: solo si NO hay obs (ni pendientes ni resueltas)
  const hasObsQuoAny = hasObsPending || hasObsResolved;
  const canViewQuotation = hasQuotation && !hasObsQuoAny;

  // 🔴 Subir nueva versión:
  // - PRECIOS: solo si preventa entregado y hay obs pendientes (o sea, ya llegó el caso a preventa)
  // - MARGENES: aparece cuando hay obs pendientes (porque se resuelve recién subiendo versión)
  const canUploadNewVersion =
    ((obsKind === "PRECIOS" || obsKind === "TECNICA") &&
      hasObsResolved &&
      preSalesDelivered > 0) ||
    (obsKind === "MARGENES" && hasObsQuoAny) ||
    (obsKind === "UNKNOWN" && hasObsQuoAny);

  const opporState = (oppor.stateOpporDesc ?? "").trim().toUpperCase();
  const canViewViability = opporState !== "PROSPECTO";

  return (
    <div className="inline-flex w-full items-center justify-end gap-1">
      {/* Comentarios */}
      {canUseViewComment && (
        <button
          onClick={() => onOpenComments(oppor)}
          className="relative rounded-md p-1.5 hover:bg-blue-100 transition-all"
          aria-label="Mensajes"
          title={hasUnread ? "Tienes comentarios nuevos" : "Ver comentarios"}
        >
          {hasUnread ? (
            <MessageSquareDot className="size-4 text-blue-600" />
          ) : (
            <MessageCircle className="size-4 text-gray-600" />
          )}

          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 badge-ping" />
          )}
        </button>
      )}

      {/* 👁️ Ver cotización (existe y sin obs) */}
      {canViewQuotation && (
        <button
          onClick={() => {
            if (oppor.linkToken) onOpenQuotation(oppor.linkToken);
            close();
          }}
          className="rounded-md p-1.5 hover:bg-blue-100 transition-all"
          aria-label="Ver cotización"
          title="Ver cotización"
        >
          <Sprout className="size-4 text-blue-600" />
        </button>
      )}

      {/* 🔴 Subir nueva versión (existe y hay obs que afectan) */}
      {canUploadNewVersion && (
        <button
          onClick={() => {
            onOpenQuotationVer(oppor);
          }}
          className="rounded-md p-1.5 hover:bg-red-100 transition-all"
          aria-label="Subir nueva versión"
          title="Subir nueva versión de cotización"
        >
          <CircleFadingArrowUp className="size-4 text-red-600" />
        </button>
      )}

      {/* Archivos */}
      {canUseFileOption && (
        <button
          onClick={() => {
            onOpenFiles(oppor);
            close();
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-100 text-yellow-600"
          aria-label="Archivos"
          title="Ver archivos "
        >
          <FolderSearch2 className="size-4" />
        </button>
      )}
      {canViewViability && (
        <button
          type="button"
          disabled={!canViewViability}
          onClick={() => {
            if (!canViewViability) return;
            onOpenViability(oppor);
            close();
          }}
          className={`rounded-md p-1.5 transition-colors ${
            canViewViability
              ? "hover:bg-indigo-50 text-indigo-600"
              : "opacity-40 cursor-not-allowed"
          }`}
          title={
            canViewViability
              ? "Ver Análisis de Viabilidad"
              : "Disponible desde ANÁLISIS en adelante"
          }
        >
          <FileText className="size-4" />
        </button>
      )}

      {/* Botón menú */}
      <button
        ref={btnRef}
        onClick={handleToggleMenu}
        className="rounded-md p-1.5 hover:bg-slate-100 transition-all"
        aria-label="Más acciones"
        title="Más acciones"
      >
        <span className="block h-4 w-4 text-slate-600 leading-none">⋮</span>
      </button>

      {/* Portal: el menú vive en <body>, no en la tabla */}
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
