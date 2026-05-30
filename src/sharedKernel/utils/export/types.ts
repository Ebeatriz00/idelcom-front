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
  /** (Opcional) Estilos avanzados para la cabecera (solo Excel) */
  headerStyle?: {
    fillColor?: string; // Hex sin #, ej "FF00FF00"
    textRotation?: number | "vertical";
    fontColor?: string; // Hex sin #, ej "FFFFFFFF"
  };
  /** (Opcional) Si es true, renderizará una barra de progreso condicional (0-100) en la columna (solo Excel) */
  isDataBar?: boolean;
};

export type ExportOptions<T> = {
  /** Nombre base de archivo, ej. "Perfiles" */
  filePrefix: string;
  /** Título del reporte (para Excel/PDF) */
  title?: string;
  /** Nombre de hoja en Excel */
  sheetName?: string;
  /** Información adicional como pares clave-valor para mostrar arriba de la tabla (solo Excel) */
  headerInfo?: { label: string; value: string }[];
  /** Tablas de resumen opcionales a mostrar arriba de la tabla principal (solo Excel) */
  summaryTables?: {
    title?: string;
    columns: ColumnSpec<any>[];
    data: any[];
  }[];
  /** Nombre/razón social (para header/footer) */
  companyName?: string;
  /** Texto de marca de agua (PDF y “truco” Excel) */
  watermarkText?: string;
  /** Función que retorna el logo en base64 (png). Por defecto usa loadLogoAsBase64() */
  getLogoBase64?: () => Promise<string>;
  /** Mapeo opcional previo a exportar (para normalizar datos) */
  mapRow?: (row: T) => T;
};
