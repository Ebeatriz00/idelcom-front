import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { CalendarDays, PackagePlus } from "lucide-react";

import type { OptionItem, PurchaseOrderGetByIdResponse } from "@/application";
import { SearchSelect } from "@/layouts";
import { usePaymentConditionOptions } from "@/sharedKernel/hooks/accounting/usePmCondition";
import { useCurrencyOptions } from "@/sharedKernel/hooks/general/useCurrency";
import { useWarehousesOptions } from "@/sharedKernel/hooks/logistic/masters/useWarehouses";
import { useSuppliersOptions } from "@/sharedKernel/hooks/logistic/purchases/useSuppliers";

import type { PurchaseOrderFormValues } from "../../utils/purchaseOrder.schema";
import {
  dash,
  formatPurchaseOrderDateValue,
  inputClass,
  numberInputClass,
} from "../../utils/purchaseOrder.helpers";
import { FieldError, Label } from "./FieldPrimitives";

type GeneralInfoProps = {
  control: Control<PurchaseOrderFormValues>;
  register: UseFormRegister<PurchaseOrderFormValues>;
  errors: FieldErrors<PurchaseOrderFormValues>;
  isView: boolean;
  existingOrder?: PurchaseOrderGetByIdResponse;
  selectedSupplier: OptionItem | null;
  selectedCurrency: OptionItem | null;
  selectedPmCondition: OptionItem | null;
  selectedWarehouse: OptionItem | null;
  watchedCurrencyId: number;
};

export function PurchaseOrderGeneralInfo({
  control,
  register,
  errors,
  isView,
  existingOrder,
  selectedSupplier,
  selectedCurrency,
  selectedPmCondition,
  selectedWarehouse,
  watchedCurrencyId,
}: GeneralInfoProps) {
  const showExchangeHelp = watchedCurrencyId === 1;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-slate-100 p-1.5 text-slate-600">
          <PackagePlus className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Información General</h2>
          <p className="text-xs text-slate-500">Datos base para registrar la orden.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <Label required>Proveedor</Label>
          {isView ? (
            <p className="py-2 text-sm font-medium text-slate-800">
              {existingOrder?.supplierName ?? dash}
            </p>
          ) : (
            <Controller
              control={control}
              name="suppliersId"
              render={({ field }) => (
                <SearchSelect
                  useOptions={useSuppliersOptions}
                  value={selectedSupplier}
                  onChange={(opt) => field.onChange(opt ? Number(opt.value) : 0)}
                  placeholder="Buscar proveedor por razón social o RUC..."
                  pageSize={100}
                  minSearchChars={0}
                  className="w-full"
                  inputClassName={[
                    "h-10 rounded-lg border px-3 text-sm shadow-none",
                    errors.suppliersId
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-200 bg-white hover:border-primary/40",
                  ].join(" ")}
                  textClassName="font-medium text-slate-800 placeholder:text-slate-400"
                />
              )}
            />
          )}
          <FieldError message={errors.suppliersId?.message} />
        </div>

        <div className="space-y-1.5 xl:col-span-1">
          <Label required>Fecha</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.purchaseOrderDate
                ? formatPurchaseOrderDateValue(existingOrder.purchaseOrderDate)
                : dash}
            </p>
          ) : (
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="date"
                className={inputClass(!!errors.purchaseOrderDate, "pl-9")}
                {...register("purchaseOrderDate")}
              />
            </div>
          )}
          <FieldError message={errors.purchaseOrderDate?.message} />
        </div>

        <div className="space-y-1.5 xl:col-span-1">
          <Label required>Moneda</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.currencyDescription ?? dash}
            </p>
          ) : (
            <Controller
              control={control}
              name="currencyId"
              render={({ field }) => (
                <SearchSelect
                  useOptions={useCurrencyOptions}
                  value={selectedCurrency}
                  onChange={(opt) => field.onChange(opt ? Number(opt.value) : 0)}
                  placeholder="Moneda"
                  pageSize={50}
                  minSearchChars={0}
                  className="w-full"
                  inputClassName={[
                    "h-10 rounded-lg border px-3 text-sm shadow-none",
                    errors.currencyId
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-200 bg-white hover:border-primary/40",
                  ].join(" ")}
                  textClassName="font-medium text-slate-800 placeholder:text-slate-400"
                />
              )}
            />
          )}
          <FieldError message={errors.currencyId?.message} />
        </div>

        <div className="space-y-1.5 xl:col-span-1">
          <Label>Tipo de cambio</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.exchangeRate ?? dash}
            </p>
          ) : (
            <input
              type="number"
              step="0.01"
              min={0}
              className={numberInputClass(!!errors.exchangeRate)}
              placeholder="1.00"
              {...register("exchangeRate", { valueAsNumber: true })}
            />
          )}
          {showExchangeHelp && !isView ? (
            <p className="text-xs text-slate-500">Aplica para moneda extranjera.</p>
          ) : null}
          <FieldError message={errors.exchangeRate?.message} />
        </div>

        <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
          <Label>Condición de pago</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.pmConditionDescription ?? dash}
            </p>
          ) : (
            <Controller
              control={control}
              name="pmConditionId"
              render={({ field }) => (
                <SearchSelect
                  useOptions={usePaymentConditionOptions}
                  value={selectedPmCondition}
                  onChange={(opt) => field.onChange(opt ? Number(opt.value) : 0)}
                  placeholder="Seleccionar condición..."
                  pageSize={50}
                  minSearchChars={0}
                  className="w-full"
                  inputClassName="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-none hover:border-primary/40"
                  textClassName="font-medium text-slate-800 placeholder:text-slate-400"
                />
              )}
            />
          )}
        </div>

        <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
          <Label>Fecha de entrega</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.expectedDeliveryDate
                ? formatPurchaseOrderDateValue(existingOrder.expectedDeliveryDate)
                : dash}
            </p>
          ) : (
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="date"
                className={inputClass(false, "pl-9")}
                {...register("expectedDeliveryDate")}
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
          <Label>Almacén</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.warehouseDescription ?? dash}
            </p>
          ) : (
            <Controller
              control={control}
              name="warehouseId"
              render={({ field }) => (
                <SearchSelect
                  useOptions={useWarehousesOptions}
                  value={selectedWarehouse}
                  onChange={(opt) => field.onChange(opt ? Number(opt.value) : undefined)}
                  placeholder="Seleccionar almacén..."
                  pageSize={100}
                  minSearchChars={0}
                  className="w-full"
                  inputClassName="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-none hover:border-primary/40"
                  textClassName="font-medium text-slate-800 placeholder:text-slate-400"
                />
              )}
            />
          )}
        </div>

        <div className="space-y-1.5 md:col-span-1 xl:col-span-2">
          <Label>Nro. cotización proveedor</Label>
          {isView ? (
            <p className="py-2 text-sm text-slate-700">
              {existingOrder?.supplierQuotationReferenceNumber ?? dash}
            </p>
          ) : (
            <input
              type="text"
              className={inputClass()}
              placeholder="Ej. COT-2026-001"
              {...register("supplierQuotationReferenceNumber")}
            />
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <Label>Referencias</Label>
          {isView ? (
            <p className="whitespace-pre-line py-2 text-sm text-slate-700">
              {existingOrder?.references ?? dash}
            </p>
          ) : (
            <textarea
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="Referencias externas o internas relacionadas..."
              {...register("references")}
            />
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <Label>Observaciones</Label>
          {isView ? (
            <p className="whitespace-pre-line py-2 text-sm text-slate-700">
              {existingOrder?.observation ?? dash}
            </p>
          ) : (
            <textarea
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="Observaciones internas..."
              {...register("observation")}
            />
          )}
        </div>
      </div>
    </section>
  );
}




