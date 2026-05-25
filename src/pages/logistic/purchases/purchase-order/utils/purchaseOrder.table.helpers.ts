import { format } from "date-fns";

import { parsePurchaseOrderDate } from "./purchaseOrder.helpers";

export function formatPurchaseOrderCurrencyValue(amount: number, currencyId: number) {
  const symbol = currencyId === 1 ? "US$" : "S/.";
  return `${symbol} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPurchaseOrderDate(date?: Date | string | null) {
  if (!date) return "-";
  try {
    const parsed = parsePurchaseOrderDate(date);
    return parsed ? format(parsed, "dd/MM/yyyy") : "-";
  } catch {
    return "-";
  }
}

export function normalizePurchaseOrderCurrencyLabel(
  currencyId: number,
  description?: string | null,
) {
  if (currencyId === 1) return "DOLARES";
  if (currencyId === 2) return "SOLES";

  const value = (description ?? "").trim().toUpperCase();
  if (value.includes("DOLAR") || value === "USD") {
    return "DOLARES";
  }
  return "SOLES";
}

export function getPurchaseOrderCurrencyBadgeClass(
  currencyId: number,
  description?: string | null,
) {
  const label = normalizePurchaseOrderCurrencyLabel(currencyId, description);

  if (label === "DOLARES") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
}

export function isPastPurchaseOrderDate(date?: Date | string | null) {
  if (!date) return false;
  const value = parsePurchaseOrderDate(date);
  if (!value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  value.setHours(0, 0, 0, 0);

  return value < today;
}
