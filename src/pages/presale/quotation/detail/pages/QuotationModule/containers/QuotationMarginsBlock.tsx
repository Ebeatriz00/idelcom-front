import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MarginsConfigCard, type MarginRowUI } from "../ui/MarginsConfigCard";

type MarginRow = {
  quotationMarginVerId?: number | null;
  marginTypeId: number;
  marginTypeName: string;
  rate: number | null;
};

type FormShape = { rows: MarginRow[] };

function RateInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step="0.01"
      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
      value={value ?? ""}
      placeholder="0.00"
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? null : Number(raw));
      }}
    />
  );
}

export function QuotationMarginsBlock({
  data,
  onSave,
}: {
  data: any;
  onSave?: (payload: any[]) => Promise<void> | void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const form = useForm<FormShape>({ defaultValues: { rows: [] } });
  const fa = useFieldArray({ control: form.control, name: "rows" });

  useEffect(() => {
    const src = (data?.margins ?? []) as any[];

    form.reset({
      rows: src.map((x) => ({
        quotationMarginVerId: x.quotationMarginVerId ?? null,
        marginTypeId: Number(x.marginTypeId),
        marginTypeName: String(x.marginTypeName ?? "").trim(),
        rate: x.marginRate != null ? Number(x.marginRate) : null,
      })),
    });

    setMode("view");
  }, [data?.quotationVerId]);

  const uiRows: MarginRowUI[] = useMemo(() => {
    return fa.fields.map((f, idx) => ({
      key: f.id,

      // Tipo fijo (nombre)
      typeField: (
        <div className="text-sm font-semibold text-zinc-900">
          {form.getValues(`rows.${idx}.marginTypeName`) || "—"}
        </div>
      ),

      // % editable
      rateField:
        mode === "edit" ? (
          <Controller
            control={form.control}
            name={`rows.${idx}.rate`}
            render={({ field }) => (
              <RateInput
                value={field.value ?? null}
                onChange={field.onChange}
              />
            )}
          />
        ) : (
          <div className="text-sm font-semibold text-zinc-900">
            {(() => {
              const v = form.getValues(`rows.${idx}.rate`);
              return v == null ? "—" : `${Number(v).toFixed(2)}%`;
            })()}
          </div>
        ),

      // sin remove hasta tener catálogo/reglas
      actions: null,
    }));
  }, [fa.fields, mode, form.control]);

  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        const payload = v.rows.map((r) => ({
          quotationMarginVerId: r.quotationMarginVerId ?? null,
          marginTypeId: r.marginTypeId,
          marginRate: r.rate ?? 0,
        }));

        await onSave?.(payload);
        setMode("view");
      })}
    >
      <MarginsConfigCard
        mode={mode}
        rows={uiRows}
        onAdd={undefined}
        right={
          mode === "edit" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50"
                onClick={() => {
                  // reset a data
                  const src = (data?.quotationMargins ?? []) as any[];
                  form.reset({
                    rows: src.map((x) => ({
                      quotationMarginVerId: x.quotationMarginVerId ?? null,
                      marginTypeId: Number(x.marginTypeId),
                      marginTypeName: String(x.marginTypeName ?? "").trim(),
                      rate: x.marginRate != null ? Number(x.marginRate) : null,
                    })),
                  });
                  setMode("view");
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800"
              >
                Guardar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50"
              onClick={() => setMode("edit")}
            >
              Editar
            </button>
          )
        }
      />
    </form>
  );
}
