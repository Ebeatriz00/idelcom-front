import { format } from "date-fns";

import type { OptionItem, PurchaseOrderGetByIdResponse } from "@/application";

import type { PurchaseOrderFormValues } from "./purchaseOrder.schema";
export const dash = "—";

export function parsePurchaseOrderDate(value?: Date | string | number | null) {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string") {
    const datePart = value.match(/^(\d{4})-(\d{2})-(\d{2})/)?.[0];
    if (datePart) {
      const [year, month, day] = datePart.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatPurchaseOrderDateValue(
  value?: Date | string | number | null,
  pattern = "dd/MM/yyyy",
) {
  const parsed = parsePurchaseOrderDate(value);
  return parsed ? format(parsed, pattern) : dash;
}

export function toPurchaseOrderDate(value?: string | null) {
  const parsed = parsePurchaseOrderDate(value);
  return parsed ?? new Date();
}

export function inputClass(hasError?: boolean, extra = "") {
  return [
    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition",
    "placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15",
    hasError ? "border-red-300 bg-red-50/30" : "border-slate-200",
    extra,
  ].join(" ");
}

export function numberInputClass(hasError?: boolean) {
  return inputClass(hasError, "text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none");
}

export function formatCurrencyValue(amount: number, currencyId: number) {
  const symbol = currencyId === 1 ? "US$" : "S/.";
  return `${symbol} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function openPurchaseOrderPdf(blob: Blob, fileName: string) {
  const pdfBlob =
    blob.type === "application/pdf"
      ? blob
      : new Blob([blob], { type: "application/pdf" });
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export function getTaxPercent(label?: string | null) {
  return parseFloat(String(label ?? "").match(/\d+(\.\d+)?/)?.[0] ?? "0");
}

export function calculateLineAmounts({
  quantity,
  unitPrice,
  discountPercent,
  taxPercent,
  priceIncludesTax,
}: {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  priceIncludesTax: boolean;
}) {
  const grossAmount = quantity * unitPrice * (1 - discountPercent / 100);
  const rate = taxPercent / 100;

  if (priceIncludesTax && rate > 0) {
    const subtotal = grossAmount / (1 + rate);
    const taxAmount = grossAmount - subtotal;
    return { grossAmount, subtotal, taxAmount, total: grossAmount };
  }

  const subtotal = grossAmount;
  const taxAmount = subtotal * rate;
  return { grossAmount, subtotal, taxAmount, total: subtotal + taxAmount };
}

export function emptyDetail(): PurchaseOrderFormValues["details"][number] {
  return {
    productsId: 0,
    productLabel: "",
    uomId: undefined,
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxesId: 0,
    priceIncludesTax: false,
    observation: "",
  };
}
export function mapPurchaseOrderToFormValues(
  order: PurchaseOrderGetByIdResponse,
  fallbackDate: string,
): PurchaseOrderFormValues {
  return {
    suppliersId: order.suppliersId,
    purchaseOrderDate: order.purchaseOrderDate
      ? formatPurchaseOrderDateValue(order.purchaseOrderDate, "yyyy-MM-dd")
      : fallbackDate,
    currencyId: order.currencyId,
    exchangeRate: order.exchangeRate ?? 1,
    pmConditionId: order.pmConditionId ?? 0,
    expectedDeliveryDate: order.expectedDeliveryDate
      ? formatPurchaseOrderDateValue(order.expectedDeliveryDate, "yyyy-MM-dd")
      : "",
    warehouseId: order.warehouseId,
    supplierQuotationReferenceNumber:
      order.supplierQuotationReferenceNumber ?? "",
    references: order.references ?? "",
    observation: order.observation ?? "",
    details:
      order.details?.map((detail) => ({
        purchaseOrderDetailId: detail.purchaseOrderDetailId,
        productsId: detail.productsId,
        productLabel: detail.productDescription ?? "",
        uomId: detail.uomId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        discountPercent: detail.discountPercent,
        taxesId: detail.taxesId ?? 0,
        priceIncludesTax: detail.priceIncludesTax,
        observation: detail.observation ?? "",
      })) ?? [],
  };
}

export function buildPurchaseOrderUpsertDto(values: PurchaseOrderFormValues) {
  return {
    suppliersId: values.suppliersId,
    purchaseOrderDate: toPurchaseOrderDate(values.purchaseOrderDate),
    currencyId: values.currencyId,
    exchangeRate: values.exchangeRate ?? 1,
    pmConditionId: values.pmConditionId ?? 0,
    expectedDeliveryDate: values.expectedDeliveryDate
      ? toPurchaseOrderDate(values.expectedDeliveryDate)
      : new Date(),
    warehouseId: values.warehouseId,
    supplierQuotationReferenceNumber: values.supplierQuotationReferenceNumber,
    references: values.references ?? "",
    observation: values.observation,
    details: values.details.map((detail) => ({
      purchaseOrderDetailId: detail.purchaseOrderDetailId,
      productsId: detail.productsId,
      uomId: detail.uomId ?? undefined,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      discountPercent: detail.discountPercent,
      taxesId: detail.taxesId,
      priceIncludesTax: detail.priceIncludesTax,
      observation: detail.observation,
    })),
  };
}

export function calculatePurchaseOrderTotals(
  details: PurchaseOrderFormValues["details"],
  taxes: OptionItem[],
) {
  return details.reduce(
    (totals, detail) => {
      const qty = Number(detail?.quantity ?? 0);
      const price = Number(detail?.unitPrice ?? 0);
      const discount = Number(detail?.discountPercent ?? 0);
      const taxOpt = taxes.find((tax) => Number(tax.value) === detail?.taxesId);
      const line = calculateLineAmounts({
        quantity: qty,
        unitPrice: price,
        discountPercent: discount,
        taxPercent: getTaxPercent(taxOpt?.label),
        priceIncludesTax: !!detail?.priceIncludesTax,
      });

      return {
        subtotal: totals.subtotal + line.subtotal,
        discountTotal: totals.discountTotal + qty * price * (discount / 100),
        taxAmount: totals.taxAmount + line.taxAmount,
        total: totals.total + line.total,
      };
    },
    { subtotal: 0, discountTotal: 0, taxAmount: 0, total: 0 },
  );
}

export function findOptionByValue(options: OptionItem[], value?: number | null) {
  if (!value) return null;
  return options.find((option) => Number(option.value) === value) ?? null;
}

export function hasIncompletePurchaseOrderLines(
  details: PurchaseOrderFormValues["details"],
) {
  return details.some(
    (detail) =>
      !detail?.productsId ||
      !detail?.taxesId ||
      Number(detail?.quantity ?? 0) <= 0 ||
      Number(detail?.unitPrice ?? 0) < 0,
  );
}

export function canSubmitPurchaseOrder({
  suppliersId,
  currencyId,
  details,
}: {
  suppliersId?: number;
  currencyId?: number;
  details: PurchaseOrderFormValues["details"];
}) {
  return (
    !!suppliersId &&
    !!currencyId &&
    details.length > 0 &&
    !hasIncompletePurchaseOrderLines(details)
  );
}


