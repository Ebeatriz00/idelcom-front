import type { OptionItem } from "@/application";
import { SearchSelect, type UseOptionsHook } from "@/layouts"; // ajusta ruta si difiere
import { useClientsOptions, useOpportunitiesOptions } from "@/sharedKernel";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HeaderInfoCard, type HeaderField } from "../ui/HeaderInfoCard";
import { fmtDate } from "../utils/format";

type HeaderForm = {
  clients: OptionItem | null;
  oppor: OptionItem | null;
};

const useClientsSSOptions: UseOptionsHook = (page, search, pageSize) =>
  useClientsOptions(page, search, pageSize);

const useOpporSSOptions: UseOptionsHook = (page, search, pageSize) =>
  useOpportunitiesOptions(0,page, search, pageSize);

export function QuotationHeaderBlock({ data }: { data: any }) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const form = useForm<HeaderForm>({
    defaultValues: {
      clients: data?.clientsId
        ? {
            value: Number(data.clientsId),
            label: data.clientsName ?? `#${data.clientsId}`,
          }
        : null,
      oppor: data?.opporId
        ? {
            value: Number(data.opporId),
            label: data.opporName ?? `#${data.opporId}`,
          }
        : null,
    },
  });

  useEffect(() => {
    form.reset({
      clients: data?.clientsId
        ? {
            value: Number(data.clientsId),
            label: data.clientsName ?? `#${data.clientsId}`,
          }
        : null,
      oppor: data?.opporId
        ? {
            value: Number(data.opporId),
            label: data.opporName ?? `#${data.opporId}`,
          }
        : null,
    });
    setMode("view");
  }, [data?.clientsId, data?.clientsName, data?.opporId, data?.opporName]);

  const fields: HeaderField[] = useMemo(
    () => [
      {
        label: "Oportunidad",
        view: data?.opporName ?? (data?.opporId ? `#${data.opporId}` : "—"),
        edit: (
          <Controller
            control={form.control}
            name="oppor"
            render={({ field }) => (
              <SearchSelect
                useOptions={useOpporSSOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Buscar oportunidad…"
                pageSize={50}
              />
            )}
          />
        ),
      },
      {
        label: "Cliente",
        view:
          data?.clientsName ?? (data?.clientsId ? `#${data.clientsId}` : "—"),
        edit: (
          <Controller
            control={form.control}
            name="clients"
            render={({ field }) => (
              <SearchSelect
                useOptions={useClientsSSOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Buscar cliente…"
                pageSize={10}
              />
            )}
          />
        ),
      },
      {
        label: "Validez (días)",
        view: data?.offerValidity != null ? `${data.offerValidity}` : "—",
      },
      {
        label: "Fecha inicio",
        view: fmtDate(data?.startDate ?? data?.StartDate),
      },
      {
        label: "Fecha fin",
        view: fmtDate(data?.finishDate ?? data?.FinishDate),
      },
      { label: "Moneda", view: data?.currencyName ?? "—" },
      { label: "Condición pago", view: data?.paymentConditionName ?? "—" },
    ],
    [
      data?.opporName,
      data?.clientsName,
      data?.offerValidity,
      data?.startDate,
      data?.StartDate,
      data?.finishDate,
      data?.FinishDate,
      data?.currencyName,
      data?.paymentConditionName,
      form.control,
    ],
  );

  return (
    <form
      onSubmit={form.handleSubmit(async () => {
        /*const payload = {
          clientsId: values.clients ? Number(values.clients.value) : null,
          opporId: values.oppor ? Number(values.oppor.value) : null,
        };*/

        // TODO: mutation save header con payload
        // await saveHeader(payload);

        setMode("view");
      })}
    >
      <HeaderInfoCard
        mode={mode}
        fields={fields}
        right={
          mode === "edit" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50"
                onClick={() => {
                  setMode("view");
                  form.reset({
                    clients: data?.clientsId
                      ? {
                          value: Number(data.clientsId),
                          label: data.clientsName ?? `#${data.clientsId}`,
                        }
                      : null,
                    oppor: data?.opporId
                      ? {
                          value: Number(data.opporId),
                          label: data.opporName ?? `#${data.opporId}`,
                        }
                      : null,
                  });
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
