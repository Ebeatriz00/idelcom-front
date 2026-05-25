import type { ExchangeRateUpsertDto } from "@/application";
import { fetchConsultExchangeRate } from "@/infrastructure";
import { NumberInput } from "@/layouts/presentation/inputs/NumberInput";
import { qkExchangeApi, useExchangeRate } from "@/sharedKernel";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, RefreshCw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function ExchangeRateForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
}: {
  defaultValues?: ExchangeRateUpsertDto;
  onSubmit: (dto: ExchangeRateUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
}) {
  const [exchangeRateId, setExchangeRateId] = useState<number | undefined>(
    defaultValues?.exchangeRateId
  );
  const [dateFxrate, setDateFxrate] = useState(defaultValues?.dateFxrate ?? "");
  const [userPicked, setUserPicked] = useState(false);

  const [purchaseType, setPurchaseType] = useState(
    defaultValues?.purchaseType ?? 0
  );
  const [saleType, setSaleType] = useState(defaultValues?.saleType ?? 0);

  useEffect(() => {
    setExchangeRateId(defaultValues?.exchangeRateId);
    setDateFxrate(defaultValues?.dateFxrate ?? "");
    setPurchaseType(defaultValues?.purchaseType ?? 0);
    setSaleType(defaultValues?.saleType ?? 0);
    setUserPicked(false);
  }, [defaultValues]);

  const isEdit = !!exchangeRateId;
  const qc = useQueryClient();

  const key = dateFxrate ? qkExchangeApi.byDate(dateFxrate) : qkExchangeApi.all;
  const cached = qc.getQueryData<any>(key);

  const enabled = userPicked && !isEdit && !!dateFxrate && !cached;

  const { data, isFetching, error } = useExchangeRate(dateFxrate, { enabled });

  const incoming = cached ?? data;

  useEffect(() => {
    if (!incoming) return;
    const buy = Number(incoming.buy ?? incoming.compra ?? 0);
    const sell = Number(incoming.sell ?? incoming.venta ?? 0);

    if (buy > 0) setPurchaseType(buy);
    if (sell > 0) setSaleType(sell);
  }, [incoming]);

  const valid = useMemo(
    () =>
      purchaseType > 0 && saleType > 0 && (dateFxrate ?? "").trim().length > 0,
    [purchaseType, saleType, dateFxrate]
  );

  async function handleFetchManual() {
    if (!dateFxrate) return;
    const res = await qc.fetchQuery({
      queryKey: qkExchangeApi.byDate(dateFxrate),
      queryFn: async () => {
        return fetchConsultExchangeRate(dateFxrate);
      },
      staleTime: 1000 * 60 * 60 * 24 * 365,
    });
    const buy = Number((res as any).buy ?? (res as any).compra ?? 0);
    const sell = Number((res as any).sell ?? (res as any).venta ?? 0);
    if (buy > 0) setPurchaseType(buy);
    if (sell > 0) setSaleType(sell);
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ exchangeRateId, dateFxrate, purchaseType, saleType });
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Fecha
        </label>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            {isFetching ? (
              <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
            ) : (
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            )}
            <input
              type="date"
              value={dateFxrate}
              onChange={(e) => {
                setDateFxrate(e.target.value);
                setUserPicked(true);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm"
              autoFocus={autofocus}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {isEdit && (
            <button
              type="button"
              onClick={handleFetchManual}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50"
              disabled={!dateFxrate || saving}
              title="Traer TC"
            >
              <RefreshCw className="size-4" />
              Traer TC
            </button>
          )}
        </div>

        {!!error && !cached && (
          <p className="mt-1 text-xs text-red-600">
            No se pudo consultar ApiPeru para {dateFxrate}. Ingresa manualmente
            o reintenta.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Cambio Compra
          </label>
          <NumberInput
            value={purchaseType}
            onValueChange={setPurchaseType}
            placeholder="Ej: 3.850"
            step="0.001"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Cambio Venta
          </label>
          <NumberInput
            value={saleType}
            onValueChange={setSaleType}
            placeholder="Ej: 3.900"
            step="0.001"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            disabled={saving}
          />
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? (
              "Guardando…"
            ) : (
              <>
                <Save className="size-4" /> Guardar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
