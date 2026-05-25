export type Paged<T> = {
  data?: T[];
  items?: T[];
  total?: number;
  pageCount?: number;
};

export type PageResult<T> = {
  data: T[];
  total?: number;
  pageCount?: number;
};

export type FetchAllProgress = {
  loaded: number;
  total?: number;
  pageIndex: number; // 0-based
  pageSize: number;
  pageCount?: number;
  pct?: number; // 0..100
};

// ========== Tipos ==========

export type ColumnSpec<T> = {
  /** Título visible del encabezado */
  label: string;
  /** Cómo obtener el valor a exportar desde la fila */
  value: (row: T) => string | number | null | undefined;
  /** (Opcional) ancho de columna en Excel (caracteres) */
  width?: number;
  /** (Opcional) ancho de columna en PDF: "auto" | "*" | número */
  pdfWidth?: "auto" | "*" | number;
  /** (Opcional) Nota o información extra para mostrar en un desplegable (Excel) */
  note?: (row: T) => string | null | undefined;
};

export type ExportOptions<T> = {
  /** Nombre base de archivo, ej. "Perfiles" */
  filePrefix: string;
  /** Título del reporte (para Excel/PDF) */
  title?: string;
  /** Nombre de hoja en Excel */
  sheetName?: string;
  /** Nombre/razón social (para header/footer) */
  companyName?: string;
  /** Texto de marca de agua (PDF y “truco” Excel) */
  watermarkText?: string;
  /** Función que retorna el logo en base64 (png). Por defecto usa loadLogoAsBase64() */
  getLogoBase64?: () => Promise<string>;
  /** Mapeo opcional previo a exportar (para normalizar datos) */
  mapRow?: (row: T) => T;
};
