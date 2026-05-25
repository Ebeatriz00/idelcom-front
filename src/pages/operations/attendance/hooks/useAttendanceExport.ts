import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useExportActions } from "@/sharedKernel/utils/export/useExportActions";
import type { ColumnSpec } from "@/sharedKernel";


export function useAttendanceExport(
  matrixData: Record<number, any>,
  days: Date[],
  startDate: Date
) {
  const colsExport = useMemo<ColumnSpec<any>[]>(() => {
    const baseCols: ColumnSpec<any>[] = [
      { label: "Trabajador", value: (r) => r.name },
      { label: "Documento", value: (r) => r.workerDocument || "-" },
      {
        label: "Cliente", value: (r) => {
          const firstRecord = Object.values(r.records).flat()[0] as any;
          return firstRecord?.clientsName || "-";
        }
      },
    ];

    const dayCols = days.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      return {
        label: format(day, "dd/MM"),
        value: (r: any) => {
          const records = r.records[dateKey];
          if (!records || records.length === 0) return "-";
          return records.map((rec: any) => rec.statusDesc).join(" | ");
        },
        note: (r: any) => {
          const records = r.records[dateKey];
          if (!records || records.length === 0) return null;
          return records.map((rec: any) => {
            const cli = (rec.clientsName || "-").replace(/,/g, ".");
            const proy = (rec.projectName || "-").replace(/,/g, ".");
            return `Cliente: ${cli},Proyecto: ${proy}`;
          }).join(",");
        }
      };
    });

    return [...baseCols, ...dayCols];
  }, [days]);

  return useExportActions({
    colsExport,
    opts: {
      filePrefix: "Asistencia",
      title: `Reporte de Asistencia - ${format(startDate, "MMMM yyyy", { locale: es })}`,
    },
    getAllForExport: async () => Object.values(matrixData),
  });
}
