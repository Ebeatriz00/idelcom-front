import type { OpportunitiesResponseDto } from "@/application";

export type GuardResult =
  | { ok: true }
  | { ok: false; msg: string; forceOpen?: boolean };

const U = (s?: string | null) => (s ?? "").trim().toUpperCase();

export const warnMsg = {
  won: "No puedes cambiar el estado. La oportunidad ya está en Ganado y es un proyecto.",

  // standBy: "La oportunidad se encuentra en estado Stand By.",

  lost: "La oportunidad está en estado Perdido. No se permiten modificaciones sobre procesos cerrados.",

  discarded:
    "La oportunidad se encuentra en estado Descartado y no admite cambios adicionales.",

  preventa: "No puedes cambiar el estado: Preventa debe estar en 'Entregado'.",

  cotizacionNewVer:
    "No puedes cambiar el estado: debes subir la nueva versión de la cotización.",

  hiringConsult:
    "No puedes cambiar estado: falta 'Entregado' en Contrataciones (Consultoría).",

  hiringDoc:
    "No puedes cambiar estado: falta 'Entregado' en Contrataciones (Documentación).",

  obsNoResuelto:
    "No puedes abrir el cambio de estado: aún tienes observaciones sin resolver.",

  obsPendienteDecision:
    "No puedes abrir el cambio de estado: faltan observaciones por aprobar o rechazar.",

  obsSinFecha: "Antes de continuar, asigna fecha límite a las observaciones.",

  taskPending: "Antes de continuar, debes de completar tus tareas pendientes.",

  managementEvaluation:
    "No puedes abrir el cambio de estado: El prospecto se encuntra en EVALUCIÓN por la gerencia comercial",

  obsLic:
    "No puedes abrir el cambio de estado: aún hay observaciones sin resolver en contrataciones.",

  obsQuoNotResolver:
    "No puedes abrir el cambio de estado: aun no se han resulto la observacion enviado al equipo de preventa.",
} as const;

type ObsQuoKind = "PRECIOS" | "MARGENES" | "TECNICA" | "UNKNOWN";

export function getObsQuoKind(o: OpportunitiesResponseDto): ObsQuoKind {
  const anyO = o as any;

  const typeId = Number(anyO.typeObsEconomic ?? NaN);
  if (!Number.isNaN(typeId)) {
    if (typeId === 1) return "MARGENES";
    if (typeId === 2) return "PRECIOS";
    if (typeId === 3) return "TECNICA";
  }
  return "UNKNOWN";
}

export function canOpenChangeState(o: OpportunitiesResponseDto): GuardResult {
  const state = U(o.stateOpporDesc);

  const preSalesDelivered = (o.preSalesDelivered ?? 0) > 0;

  const taskPendings = (o.tasks ?? 0) > 0;

  // 1️⃣ GANADO
  if (state === "GANADO") return { ok: false, msg: warnMsg.won };

  // 2️⃣ EVALUACION GERENCIAL
  if (state === "EVALUACION GERENCIAL")
    return { ok: false, msg: warnMsg.managementEvaluation };

  // 3️⃣ OBSERVADO
  if (state === "OBSERVADO") {
    const obsNoDueDate = o.obsNotDate ?? 0;
    const obsNotResolved = o.obsNotResolved ?? 0;
    const obsPendingDecision = o.obsNotApproved ?? 0;

    if (obsNotResolved > 0) return { ok: false, msg: warnMsg.obsNoResuelto };

    if (obsPendingDecision > 0)
      return { ok: false, msg: warnMsg.obsPendienteDecision };

    if (obsNoDueDate > 0)
      return { ok: false, msg: warnMsg.obsSinFecha, forceOpen: true };

    return { ok: true };
  }

  // ✅ TAREAS PENDIENTES (siempre bloquea)
  if (taskPendings) return { ok: false, msg: warnMsg.taskPending };

  // 4️⃣ Preventa entregado requerido para OPORTUNIDAD / NEGOCIACION
  if (
    (state === "OPORTUNIDAD" || state === "NEGOCIACION") &&
    !preSalesDelivered
  ) {
    return { ok: false, msg: warnMsg.preventa };
  }

  // 5️⃣ NEGOCIACION → PRECIOS vs MARGENES
  if (state === "NEGOCIACION") {
    const kind = getObsQuoKind(o);

    const pending = (o.obsQuo ?? 0) > 0;
    const resolved = (o.obsQuoResolved ?? 0) > 0;

    // ---- PRECIOS Y TECNICA----
    if (kind === "PRECIOS" || kind === "TECNICA") {
      // Si hay obs pendientes de precios -> no puedes avanzar, falta resolución de preventa
      if (pending) return { ok: false, msg: warnMsg.obsQuoNotResolver };

      // Si ya está resuelto (y no hay pendientes) -> ahora sí toca subir nueva versión
      // (y como esto viene de preventa, exigimos preventa entregado)
      if (resolved && preSalesDelivered) {
        return { ok: false, msg: warnMsg.cotizacionNewVer };
      }
    }

    // ---- MARGENES ----
    if (kind === "MARGENES") {
      // En márgenes se pide nueva versión cuando existe obs (pendiente o resuelta)
      if (pending || resolved)
        return { ok: false, msg: warnMsg.cotizacionNewVer };
    }

    // ---- Tipo desconocido ----
    // Si hay algo de obs y no sabemos el tipo, por seguridad pedimos nueva versión
    if (pending || resolved)
      return { ok: false, msg: warnMsg.cotizacionNewVer };
  }

  // 6️⃣ Contrataciones
  if (o.isHiring === true) {
    const licConsultDelivered = (o.licConsultDelivered ?? 0) > 0;
    const licDocDelivered = (o.licDocDelivered ?? 0) > 0;
    const obsNotResolvedLic = (o.obsNotResolvedLic ?? 0) > 0;

    switch (state) {
      case "PROSPECTO":
        if (!licConsultDelivered)
          return { ok: false, msg: warnMsg.hiringConsult };
        break;

      case "OPORTUNIDAD":
        if (!licDocDelivered) return { ok: false, msg: warnMsg.hiringDoc };
        break;

      case "NEGOCIACION":
        if (obsNotResolvedLic) return { ok: false, msg: warnMsg.obsLic };
        break;
    }
  }

  switch (state) {
    case "PERDIDO":
      return { ok: false, msg: warnMsg.lost };

    case "DESCARTADO":
      return { ok: false, msg: warnMsg.discarded };

    // case "STAND BY":
    //   return { ok: false, msg: warnMsg.standBy };
  }

  return { ok: true };
}
