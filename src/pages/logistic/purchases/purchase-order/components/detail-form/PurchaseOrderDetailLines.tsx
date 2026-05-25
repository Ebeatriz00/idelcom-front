import {
  type Control,
  type FieldErrors,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { AlertCircle, PackagePlus, Plus } from "lucide-react";

import type { OptionItem } from "@/application";

import type { PurchaseOrderFormValues } from "../../utils/purchaseOrder.schema";
import { emptyDetail } from "../../utils/purchaseOrder.helpers";
import { PurchaseOrderLineItem } from "./PurchaseOrderLineItem";

type DetailLinesProps = {
  control: Control<PurchaseOrderFormValues>;
  register: UseFormRegister<PurchaseOrderFormValues>;
  setValue: UseFormSetValue<PurchaseOrderFormValues>;
  errors: FieldErrors<PurchaseOrderFormValues>;
  fields: { id: string }[];
  details: PurchaseOrderFormValues["details"];
  products: OptionItem[];
  taxes: OptionItem[];
  currencyId: number;
  isView: boolean;
  append: UseFieldArrayAppend<PurchaseOrderFormValues, "details">;
  remove: UseFieldArrayRemove;
};

export function PurchaseOrderDetailLines({
  control,
  register,
  setValue,
  errors,
  fields,
  details,
  products,
  taxes,
  currencyId,
  isView,
  append,
  remove,
}: DetailLinesProps) {
  const countLabel = `${fields.length} producto${fields.length === 1 ? "" : "s"}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-950">Líneas de detalle</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {countLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500">Productos, cantidades e impuestos de la orden.</p>
        </div>
        {!isView ? (
          <button
            type="button"
            onClick={() => append(emptyDetail())}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-primary transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar producto
          </button>
        ) : null}
      </div>

      {errors.details?.root?.message ? (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4" aria-hidden="true" />
          {errors.details.root.message}
        </div>
      ) : null}

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <PackagePlus className="mx-auto mb-3 size-10 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">
            {isView ? "Sin productos registrados" : "Aún no agregaste productos"}
          </p>
          {!isView ? (
            <button
              type="button"
              onClick={() => append(emptyDetail())}
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-primary transition hover:bg-orange-50"
            >
              <Plus className="size-4" aria-hidden="true" />
              Agregar producto
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <PurchaseOrderLineItem
              key={field.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              detail={details[index]}
              products={products}
              taxes={taxes}
              currencyId={currencyId}
              isView={isView}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
