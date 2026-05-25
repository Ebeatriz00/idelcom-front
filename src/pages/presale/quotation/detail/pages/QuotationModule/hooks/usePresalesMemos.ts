import { useMemo } from "react";

const PAGE_SIZE = 10;

function getPlanMonth(p: any): number | null {
  // 1) si existiera a nivel plan
  if (p?.mesPedido != null) return p.mesPedido;

  // 2) tu caso: monthNo está en las líneas
  const m = p?.lines?.[0]?.monthNo;
  return m ?? null;
}

export function usePresalesMemos(
  data: any,
  page: number,
  selectedMonth: number | null
) {
  const { quotationTotal, scheduleTotal, diffTotal } = useMemo(() => {
    const rows = data?.servChecks ?? [];
    const quotationTotal = rows.reduce(
      (a: number, x: any) => a + (x.quotationAmount ?? 0),
      0
    );
    const scheduleTotal = rows.reduce(
      (a: number, x: any) => a + (x.scheduleAmount ?? 0),
      0
    );
    const diffTotal = rows.reduce(
      (a: number, x: any) => a + (x.differenceAmount ?? 0),
      0
    );
    return { quotationTotal, scheduleTotal, diffTotal };
  }, [data?.servChecks]);

  // -----------------
  // EGRESOS (igual)
  // -----------------
  const egressByMonth = useMemo(() => {
    const rows = data?.egresses ?? [];
    const entries = rows
      .map((m: any) => {
        const sum = (m.lines ?? []).reduce(
          (acc: number, l: any) => acc + (l.amount ?? 0),
          0
        );
        return [m.monthNo, sum] as const;
      })
      .filter(([, sum]: readonly [number, number]) => Math.abs(sum) > 0.0001);

    return new Map<number, number>(entries);
  }, [data?.egresses]);

  const egressMonths = useMemo(() => {
    const rows = data?.egresses ?? [];
    const nonEmpty = rows.filter((m: any) => {
      const sum = (m.lines ?? []).reduce(
        (acc: number, l: any) => acc + (l.amount ?? 0),
        0
      );
      return Math.abs(sum) > 0.0001;
    });

    const sorted = [...nonEmpty].sort(
      (a: any, b: any) => a.monthNo - b.monthNo
    );
    return selectedMonth == null
      ? sorted
      : sorted.filter((x: any) => x.monthNo === selectedMonth);
  }, [data?.egresses, selectedMonth]);

  // -----------------
  // PAGOS (nuevo)
  // -----------------
  const plansAll = useMemo(() => data?.linePlans ?? [], [data?.linePlans]);

  // Chips: resumen por mes (como egresos)
  const paymentsByMonth = useMemo(() => {
    const byMonth = new Map<
      number,
      { month: number; totalAmount: number; count: number }
    >();

    for (const p of plansAll) {
      const m = getPlanMonth(p);
      if (m == null) continue;

      const amount = (p.lines ?? []).reduce(
        (acc: number, l: any) => acc + (l.paymentAmount ?? 0),
        0
      );

      const cur = byMonth.get(m) ?? { month: m, totalAmount: 0, count: 0 };
      cur.totalAmount += amount;
      cur.count += 1;
      byMonth.set(m, cur);
    }

    return Array.from(byMonth.values()).sort((a, b) => a.month - b.month);
  }, [plansAll]);

  // Filtrado por mes (ANTES de paginar)
  const plansRows = useMemo(() => {
    if (selectedMonth == null) return plansAll;
    return plansAll.filter((p: any) => getPlanMonth(p) === selectedMonth);
  }, [plansAll, selectedMonth]);

  // paymentIndexes (PAGO 01..N): usa paymentNo (más correcto que seqNo)
  const paymentIndexes = useMemo(() => {
    const used = new Set<number>();

    for (const p of plansRows) {
      for (const l of p.lines ?? []) {
        if ((l.paymentAmount ?? 0) !== 0) used.add(l.paymentNo ?? l.seqNo);
      }
    }
    return Array.from(used).sort((a, b) => a - b);
  }, [plansRows]);

  // Paginación sobre lo ya filtrado
  const totalRows = plansRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return plansRows.slice(start, start + PAGE_SIZE);
  }, [plansRows, safePage]);

  return {
    quotationTotal,
    scheduleTotal,
    diffTotal,

    egressByMonth,
    egressMonths,

    // pagos
    paymentsByMonth, // ✅ chips
    paymentIndexes,
    plansRows,
    pageRows,

    totalRows,
    totalPages,
    safePage,
    PAGE_SIZE,
  };
}
