export function money(value?: number) {
  return Number(value ?? 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

export function dateText(value?: Date | string | null) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-PE");
}

export function numberText(value?: number) {
  return Number(value ?? 0).toLocaleString("es-PE", {
    maximumFractionDigits: 2,
  });
}
