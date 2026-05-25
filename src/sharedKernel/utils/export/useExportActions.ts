import type { ColumnSpec } from "@/sharedKernel";
import { exportCSV, exportExcel, exportPdf } from "@/sharedKernel";
import { showProgressToast } from "@/sharedKernel/alerts/showProgressToast";

type GetAllFn<T> = (onPct?: (pct: number) => void) => Promise<T[]>;

type ConfirmFn = (entityLabel: string, limit: number) => Promise<boolean>;

type ExportOpts = {
  filePrefix: string;
  title: string;
  autoFilter?: boolean;
};

type PdfConfig<T> = {
  /** límite de filas para PDF (ej 150/300) */
  limit: number;
  /** texto para el confirm (ej "oportunidades", "clientes") */
  entityLabel: string;
  /** si quieres un fetch específico para PDF (más rápido) */
  getForPdf?: GetAllFn<T>;
  /** confirm custom (SweetAlert, etc) */
  confirm?: ConfirmFn;
};

export function useExportActions<T>(args: {
  colsExport: ColumnSpec<T>[];
  opts: ExportOpts;
  getAllForExport: GetAllFn<T>;
  pdf?: PdfConfig<T>;
}) {
  const { colsExport, opts, getAllForExport, pdf } = args;

  const runWithProgress = async (
    label: string,
    fn: (ctx: { setPct: (pct: number) => void; setLabel: (s: string) => void }) => Promise<number | void>,
  ) => {
    const t = showProgressToast(label);
    await new Promise(requestAnimationFrame);

    try {
      const count = await fn({
        setPct: (v) => t.setPct(Math.max(0, Math.min(95, v))),
        setLabel: t.setLabel,
      });

      t.setLabel("Finalizando descarga…");
      t.setPct(100);
      await new Promise(requestAnimationFrame);

      t.success(count != null ? `Exportado: ${count} registros` : "Exportación completada");
    } catch (e) {
      t.error("Falló la exportación");
      throw e;
    }
  };

  const onCsv = async () => {
    await runWithProgress("Exportando CSV…", async ({ setPct, setLabel }) => {
      const all = await getAllForExport((p) => setPct(Math.round(p * 0.8)));
      setLabel("Generando archivo…");
      setPct(95);
      await new Promise(requestAnimationFrame);
      await exportCSV(all, colsExport, opts);
      return all.length;
    });
  };

  const onXlsx = async () => {
    await runWithProgress("Exportando Excel…", async ({ setPct, setLabel }) => {
      const all = await getAllForExport((p) => setPct(Math.round(p * 0.8)));
      setLabel("Generando archivo…");
      setPct(95);
      await new Promise(requestAnimationFrame);
      await exportExcel(all, colsExport, opts);
      return all.length;
    });
  };

  const onPdf = pdf
    ? async () => {
        const confirm = pdf.confirm;
        const ok = confirm ? await confirm(pdf.entityLabel, pdf.limit) : true;
        if (!ok) return;

        await runWithProgress(`Preparando PDF (${pdf.limit})…`, async ({ setPct, setLabel }) => {
          const rows = pdf.getForPdf
            ? await pdf.getForPdf((p) => setPct(Math.round(p * 0.8)))
            : (await getAllForExport((p) => setPct(Math.round(p * 0.8)))).slice(0, pdf.limit);

          setLabel("Generando PDF…");
          setPct(95);
          await new Promise(requestAnimationFrame);

          await exportPdf(rows.slice(0, pdf.limit), colsExport, {
            ...opts,
            title: `${opts.title} (primeros ${pdf.limit})`,
          });

          return Math.min(rows.length, pdf.limit);
        });
      }
    : undefined;

  return { onCsv, onXlsx, onPdf };
}
