// hooks/useFilteredActivities.ts
import type { OpportunitiesDetailDto } from "@/application";
import { normFree } from "@/sharedKernel";
import { useMemo } from "react";
import {
  inSameMonth,
  inSameWeek,
  isSameDay,
  toDateSafeInput,
} from "../utils/dates";
import { normState, type RangeQuick } from "../utils/normalize";

type Row = NonNullable<OpportunitiesDetailDto["activityList"]>[number];

export function useFilteredActivities(
  rows: Row[],
  {
    q,
    type,
    state,
    range,
  }: { q: string; type: string; state: string; range: RangeQuick }
) {
  return useMemo(() => {
    const now = new Date();
    const qLower = q.trim().toLowerCase();

    const passRange = (d: Date, st?: string) => {
      const stateNorm = normState(st);
      switch (range) {
        case "hoy":
          return isSameDay(d, now);
        case "semana":
          return inSameWeek(d, now);
        case "mes":
          return inSameMonth(d, now);
        case "vencidas": {
          const end = new Date(now);
          end.setHours(23, 59, 59, 999);
          return d < end && stateNorm === "pendiente";
        }
        case "completadas":
          return stateNorm === "completada";
        default:
          return true;
      }
    };

    return rows
      .filter((a) => {
        const d = toDateSafeInput(a.dateActivity);

        const matchQ =
          !qLower ||
          (a.activity ?? "").toLowerCase().includes(qLower) ||
          (a.messageAddition ?? "").toLowerCase().includes(qLower) ||
          (a.workerName ?? "").toLowerCase().includes(qLower);

        const filterType = normFree(type); 
        const filterState = normFree(state);

        const rowType = normFree(a.activityPriority);
        const rowState = normFree(a.activityState);

        const matchType = !filterType || rowType === filterType;
        const matchState = !filterState || rowState === filterState;

        return (
          matchQ && matchType && matchState && passRange(d, a.activityState)
        );
      })
      .sort(
        (a, b) =>
          +toDateSafeInput(b.dateActivity) - +toDateSafeInput(a.dateActivity)
      );
  }, [rows, q, type, state, range]);
}
