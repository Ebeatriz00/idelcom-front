import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";

import { loadLogoAsBase64 } from "@/sharedKernel/utils/logo";
import { getBusinessNameFromStorage } from "@/stores/auth/storage";
import { ensurePdfVfs } from "../ensurePdfVfs";
import { escapeCSV, today, toStr } from "../utils";
import type { ColumnSpec, ExportOptions } from "@/sharedKernel";


// ========== CSV ==========
export async function exportCSV<T>(
  rows: T[],
  cols: ColumnSpec<T>[],
  opts: ExportOptions<T>,
) {
  const rowsMapped = opts.mapRow ? rows.map(opts.mapRow) : rows;
  const headers = cols.map((c) => c.label);
  const lines = rowsMapped.map((r) => cols.map((c) => toStr(c.value(r))));

  let csv = "\uFEFF" + headers.join(",") + "\n"; // BOM para acentos
  csv += lines.map((cols) => cols.map(escapeCSV).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${opts.filePrefix}_${today()}.csv`);
}

// ========== EXCEL ==========
export async function exportExcel<T>(
  rows: T[],
  cols: ColumnSpec<T>[],
  opts: ExportOptions<T>,
) {
  const rowsMapped = opts.mapRow ? rows.map(opts.mapRow) : rows;

  const logoB64 = await (opts.getLogoBase64
    ? opts.getLogoBase64()
    : loadLogoAsBase64());
  const company = opts.companyName ?? getBusinessNameFromStorage() ?? "";
  const title = opts.title ?? `${company} - Reporte`;
  const sheetName = opts.sheetName ?? opts.filePrefix;
  const watermark = opts.watermarkText ?? company;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  // Logo
  if (logoB64) {
    const imgId = wb.addImage({ base64: logoB64, extension: "png" });
    ws.addImage(imgId, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 40 },
    });
  }

  // Título
  ws.mergeCells(3, 1, 3, cols.length);
  const titleCell = ws.getCell(3, 1);
  titleCell.value = title;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { vertical: "middle" };

  ws.addRow([]); // Espacio en blanco después del título

  // Metadata / Cabecera (headerInfo)
  if (opts.headerInfo && opts.headerInfo.length > 0) {
    opts.headerInfo.forEach(info => {
      const row = ws.addRow([info.label, info.value]);
      row.getCell(1).font = { bold: true, color: { argb: "FF334155" } };
      if (cols.length > 2) {
        ws.mergeCells(row.number, 2, row.number, cols.length);
      }
    });
    ws.addRow([]); // Espacio en blanco antes de la tabla
  }

  // Tablas de resumen adicionales (summaryTables)
  if (opts.summaryTables && opts.summaryTables.length > 0) {
    opts.summaryTables.forEach((st) => {
      if (st.title) {
        const tr = ws.addRow([st.title]);
        tr.getCell(1).font = { bold: true, size: 12, color: { argb: "FF334155" } };
        ws.mergeCells(tr.number, 1, tr.number, st.columns.length);
      }
      
      const shr = ws.addRow(st.columns.map(c => c.label));
      shr.font = { bold: true };
      shr.eachCell((c, colNumber) => {
         const colSpec = st.columns[colNumber - 1];
         const fillColor = colSpec.headerStyle?.fillColor || "FFD8F3DC";
         c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
         
         if (colSpec.headerStyle?.textRotation) {
           c.alignment = { ...c.alignment, textRotation: colSpec.headerStyle.textRotation as any, vertical: "middle", horizontal: "center" };
         }
         if (colSpec.headerStyle?.fontColor) {
           c.font = { ...c.font, color: { argb: colSpec.headerStyle.fontColor } };
         }
         
         c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      });
      
      st.data.forEach(row => {
        const sdr = ws.addRow(st.columns.map(c => c.value(row)));
        sdr.eachCell(c => {
          c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        });
      });
      
      st.columns.forEach((c, i) => {
        if (c.isDataBar) {
          const colLetter = ws.getColumn(i + 1).letter;
          const startRow = shr.number + 1;
          const endRow = shr.number + st.data.length;
          if (startRow <= endRow) {
            ws.addConditionalFormatting({
              ref: `${colLetter}${startRow}:${colLetter}${endRow}`,
              rules: [
                {
                  type: 'dataBar',
                  cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 100 }],
                  color: { argb: 'FF00B050' } // Verde brillante
                } as any
              ]
            });
          }
        }
      });
      
      st.columns.forEach((c, i) => {
        const col = ws.getColumn(i + 1);
        if (c.width && (!col.width || c.width > col.width)) {
          col.width = c.width;
        }
      });

      ws.addRow([]); // Espacio
    });
  }

  // Encabezados de la tabla principal
  const headerRow = ws.addRow(cols.map((c) => c.label));
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  headerRow.eachCell((c) => {
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" },
    };
    c.border = { top: { style: "thin" }, bottom: { style: "thin" } };
  });

  // Datos
  rowsMapped.forEach((r) => {
    const excelRow = ws.addRow(cols.map((c) => c.value(r)));
    
    // Aplicar Notas (Desplegables)
    cols.forEach((c, i) => {
      if (c.note) {
        const noteValue = c.note(r);
        if (noteValue) {
          const cell = excelRow.getCell(i + 1);
          cell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${noteValue.replace(/"/g, '""')}"`],
          };
        }
      }
    });
  });

  // Agregar Filtro Automático a la tabla (AutoFilter)
  ws.autoFilter = {
    from: { row: headerRow.number, column: 1 },
    to: { row: headerRow.number + rowsMapped.length, column: cols.length }
  };

  // Anchos de columnas
  cols.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width ?? 18;
  });

  // Footer página
  ws.headerFooter.oddFooter = `&L${company}&C&P de &N&R${today()} - Generado por el sistema`;

  // Marca de agua (truco)
  if (watermark) {
    const wRow = ws.addRow([watermark, ...Array(cols.length - 1).fill("")]);
    wRow.height = 60;
    ws.mergeCells(wRow.number, 1, wRow.number, cols.length);
    const wmCell = ws.getCell(wRow.number, 1);
    wmCell.font = { size: 48, bold: true, color: { argb: "22AAAAAA" } };
    wmCell.alignment = { horizontal: "center" };
  }

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${opts.filePrefix}_${today()}.xlsx`,
  );
}

// ========== PDF ==========
export async function exportPdf<T>(
  rows: T[],
  cols: ColumnSpec<T>[],
  opts: ExportOptions<T>,
) {
  await ensurePdfVfs();

  const rowsMapped = opts.mapRow ? rows.map(opts.mapRow) : rows;

  const logoB64 = await (opts.getLogoBase64
    ? opts.getLogoBase64()
    : loadLogoAsBase64());
  const company = opts.companyName ?? getBusinessNameFromStorage() ?? "";
  const title = opts.title ?? `Reporte · ${today()}`;
  const watermark = opts.watermarkText ?? company;

  // helper para truncar texto largo en PDF (evita que “rompa” columnas)
  const clamp = (v: unknown, max = 80) => {
    const s = toStr(v);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  };

  const headerCells = cols.map((c) => ({
    text: c.label,
    bold: true,
    color: "#111827",
  }));

  const body = [
    headerCells,
    ...rowsMapped.map((r) =>
      cols.map((c, idx) => {
        const raw = c.value(r);
        const text = toStr(raw);

        // ⚙️ si quieres truncar SOLO algunas columnas largas
        const max =
          idx === 1 /* Oportunidad */ ? 120 : idx === 2 /* Cliente */ ? 70 : 40;

        return {
          text: clamp(text, max),
          noWrap: false,
        };
      }),
    ),
  ];

  // ✅ widths: mezcla de fijos + flex
  // Si no envías pdfWidth por columna, esto te salva la vida.
  const widths = cols.map((c, i) => {
    if (c.pdfWidth) return c.pdfWidth;

    // Ajusta según tu tabla de oportunidades:
    // Num Proyecto: chico
    if (i === 0) return 40;

    // Col 1: Proyecto -> Que ocupe todo el espacio sobrante
    if (i === 1) return "*";

    // Col 2 y 3: Fechas -> 'auto' se ajusta al texto exacto (dd/mm/yyyy)
    if (i === 2 || i === 3) return "auto";

    // Col 4: Cliente -> Darle un espacio fijo moderado o porcentaje
    if (i === 4) return 85;

    // Col 5, 6: Vendedor, Responsable -> 'auto' o fijo pequeño
    if (i === 5 || i === 6) return "auto";

    // Resto (Estados) -> 'auto' suele funcionar bien si el texto es corto
    return "auto";
  });

  const docDef: any = {
    pageSize: "A4",
    pageOrientation: "landscape", // ✅ evita corte por ancho
    pageMargins: [28, 68, 28, 44], // ✅ un poco más compacto que 40/80/40/60

    background: watermark
      ? [
        {
          text: watermark,
          color: "#9CA3AF",
          opacity: 0.12, // ✅ más sutil (no tapa data)
          bold: true,
          fontSize: 64,
          alignment: "center",
          margin: [0, 160, 0, 0],
        },
      ]
      : undefined,

    header: {
      margin: [28, 16, 28, 0],
      columns: [
        logoB64 ? { image: logoB64, width: 110 } : {},
        {
          width: "*",
          alignment: "right",
          stack: [
            { text: company, bold: true, fontSize: 10, color: "#111827" },
            { text: title, fontSize: 9, color: "#6B7280" },
          ],
        },
      ],
    },

    footer: (currentPage: number, pageCount: number) => ({
      margin: [28, 0, 28, 16],
      columns: [
        { text: company, fontSize: 8, color: "#6B7280" },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: "right",
          fontSize: 8,
          color: "#6B7280",
        },
      ],
    }),

    content: [
      {
        table: {
          headerRows: 1,
          widths,
          body,
          dontBreakRows: true,
          keepWithHeaderRows: 1,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#F3F4F6" : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#E5E7EB",
          vLineColor: () => "#E5E7EB",

          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
      },
    ],

    defaultStyle: { fontSize: 8 },
  };

  (pdfMake as any)
    .createPdf(docDef)
    .download(`${opts.filePrefix}_${today()}.pdf`);
}
