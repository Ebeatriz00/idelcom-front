import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { Check, Trash2, X } from "lucide-react";

import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { useProductsOptions } from "@/sharedKernel/hooks/logistic/masters/useProducts";
import { useTaxesOptions } from "@/sharedKernel/hooks/Taxes/useTaxes";

import type { PurchaseOrderFormValues } from "../../utils/purchaseOrder.schema";
import {
  calculateLineAmounts,
  dash,
  formatCurrencyValue,
  getTaxPercent,
  numberInputClass,
} from "../../utils/purchaseOrder.helpers";
import { FieldError, Label } from "./FieldPrimitives";

type PurchaseOrderLineItemProps = {
  index: number;
  control: Control<PurchaseOrderFormValues>;
  register: UseFormRegister<PurchaseOrderFormValues>;
  setValue: UseFormSetValue<PurchaseOrderFormValues>;
  errors: FieldErrors<PurchaseOrderFormValues>;
  detail?: PurchaseOrderFormValues["details"][number];
  products: OptionItem[];
  taxes: OptionItem[];
  currencyId: number;
  isView: boolean;
  onRemove: () => void;
};

export function PurchaseOrderLineItem({
  index,
  control,
  register,
  setValue,
  errors,
  detail,
  products,
  taxes,
  currencyId,
  isView,
  onRemove,
}: PurchaseOrderLineItemProps) {
  const lineErrors = errors.details?.[index];
  const hasError = Boolean(
    lineErrors?.productsId?.message ||
      lineErrors?.quantity?.message ||
      lineErrors?.unitPrice?.message ||
      lineErrors?.discountPercent?.message ||
      lineErrors?.taxesId?.message,
  );
  const qty = Number(detail?.quantity ?? 0);
  const price = Number(detail?.unitPrice ?? 0);
  const discount = Number(detail?.discountPercent ?? 0);
  const selectedProduct =
    products.find((p) => Number(p.value) === detail?.productsId) ?? null;
  const selectedTax = taxes.find((t) => Number(t.value) === detail?.taxesId) ?? null;
  const lineAmounts = calculateLineAmounts({
    quantity: qty,
    unitPrice: price,
    discountPercent: discount,
    taxPercent: getTaxPercent(selectedTax?.label),
    priceIncludesTax: !!detail?.priceIncludesTax,
  });

  return (
    <article
      className={[
        "rounded-lg border bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/20",
        hasError ? "border-red-200 ring-1 ring-red-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Producto #{index + 1}
        </span>
        {!isView ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
            title="Eliminar producto"
            aria-label="Eliminar producto"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label required>Producto</Label>
        {isView ? (
          <p className="py-1 text-sm font-medium text-slate-800">
            {detail?.productLabel ?? `Producto #${detail?.productsId}`}
          </p>
        ) : (
          <Controller
            control={control}
            name={`details.${index}.productsId`}
            render={({ field }) => (
              <SearchSelect
                useOptions={useProductsOptions}
                value={selectedProduct}
                onChange={(opt) => {
                  field.onChange(opt ? Number(opt.value) : 0);
                  setValue(`details.${index}.productLabel`, opt?.label ?? "");
                }}
                placeholder="Buscar producto..."
                pageSize={100}
                minSearchChars={0}
                className="w-full"
                inputClassName={[
                  "h-10 rounded-lg border px-3 text-sm shadow-none",
                  lineErrors?.productsId
                    ? "border-red-300 bg-red-50/30"
                    : "border-slate-200 bg-white hover:border-primary/40",
                ].join(" ")}
                textClassName="font-medium text-slate-800 placeholder:text-slate-400"
              />
            )}
          />
        )}
        <FieldError message={lineErrors?.productsId?.message} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="space-y-1.5">
          <Label required>Cantidad</Label>
          {isView ? (
            <p className="py-2 text-right text-sm font-semibold text-slate-800 tabular-nums">
              {detail?.quantity}
            </p>
          ) : (
            <input
              type="number"
              min={0.01}
              step="0.01"
              className={numberInputClass(!!lineErrors?.quantity)}
              {...register(`details.${index}.quantity`, { valueAsNumber: true })}
            />
          )}
          <FieldError message={lineErrors?.quantity?.message} />
        </div>

        <div className="space-y-1.5">
          <Label required>Precio unitario</Label>
          {isView ? (
            <p className="py-2 text-right text-sm font-semibold text-slate-800 tabular-nums">
              {formatCurrencyValue(Number(detail?.unitPrice ?? 0), currencyId)}
            </p>
          ) : (
            <input
              type="number"
              min={0}
              step="0.01"
              className={numberInputClass(!!lineErrors?.unitPrice)}
              {...register(`details.${index}.unitPrice`, { valueAsNumber: true })}
            />
          )}
          <FieldError message={lineErrors?.unitPrice?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Desc. %</Label>
          {isView ? (
            <p className="py-2 text-right text-sm font-semibold text-slate-800 tabular-nums">
              {detail?.discountPercent ?? 0}%
            </p>
          ) : (
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              className={numberInputClass(!!lineErrors?.discountPercent)}
              {...register(`details.${index}.discountPercent`, { valueAsNumber: true })}
            />
          )}
          <FieldError message={lineErrors?.discountPercent?.message} />
        </div>

        <div className="space-y-1.5">
          <Label required>Impuesto</Label>
          {isView ? (
            <p className="py-2 text-sm font-semibold text-slate-800">
              {selectedTax?.label ?? dash}
            </p>
          ) : (
            <Controller
              control={control}
              name={`details.${index}.taxesId`}
              render={({ field }) => (
                <SearchSelect
                  useOptions={useTaxesOptions}
                  value={selectedTax}
                  onChange={(opt) => field.onChange(opt ? Number(opt.value) : 0)}
                  placeholder="IGV..."
                  pageSize={20}
                  minSearchChars={0}
                  className="w-full"
                  inputClassName={[
                    "h-10 rounded-lg border px-3 text-sm shadow-none",
                    lineErrors?.taxesId
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-200 bg-white hover:border-primary/40",
                  ].join(" ")}
                  textClassName="text-slate-800 placeholder:text-slate-400"
                />
              )}
            />
          )}
          <FieldError message={lineErrors?.taxesId?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Subtotal</Label>
          <div className="flex h-10 items-center justify-end rounded-lg bg-orange-50 px-3 text-sm font-bold text-orange-700 ring-1 ring-orange-100 tabular-nums">
            {formatCurrencyValue(lineAmounts.subtotal, currencyId)}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Precio con IGV</Label>
          {isView ? (
            <div className="flex h-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
              {detail?.priceIncludesTax ? (
                <Check className="size-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <X className="size-4 text-slate-400" aria-hidden="true" />
              )}
            </div>
          ) : (
            <Controller
              control={control}
              name={`details.${index}.priceIncludesTax`}
              render={({ field }) => {
                const checked = !!field.value;

                return (
                  <button
                    type="button"
                    onClick={() => field.onChange(!checked)}
                    className={[
                      "flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition",
                      checked
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                    title="Precio con IGV"
                    aria-pressed={checked}
                  >
                    {checked ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <X className="size-4" aria-hidden="true" />
                    )}
                    {checked ? "Sí" : "No"}
                  </button>
                );
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

