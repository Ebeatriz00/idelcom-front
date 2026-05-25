import type { ClientsUpdateChangeSalesDto, OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { useSalesWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { makeLocalUseOptions } from "@/sharedKernel/hooks/SelectOptions/makeLocalUseOptions";
import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCrmAccountsPerms } from "../../hooks/permissions/accounts.perms";

// ✅ Normaliza ids: 0 / "0" / null / "" => undefined
const normalizeId = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// ✅ Para selects requeridos: si llega 0, que sea vacío (undefined)
const requiredSelect = z.preprocess(
  (v) =>
    v === 0 || v === "0" || v == null || v === "" ? undefined : Number(v),
  z.number({ invalid_type_error: "Requerido" })
);

const schema = z.object({
  clientsId: z.number().optional(),
  workerId: requiredSelect,
});

type FormValues = z.infer<typeof schema>;

function mapToFormValues(
  d?: Partial<ClientsUpdateChangeSalesDto>
): Partial<FormValues> {
  if (!d) return {};
  return {
    clientsId: d.clientsId,
    workerId: normalizeId(d.workerId),
  };
}

// ✅ No crear opción si id es 0
const idToOption = (id?: number | null, label?: string) => {
  const n = normalizeId(id);
  return n ? { value: n, label: label ?? `ID ${n}` } : null;
};

export function VendorForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  workerLabel,
}: {
  defaultValues?: Partial<ClientsUpdateChangeSalesDto>;
  onSubmit: (dto: ClientsUpdateChangeSalesDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  workerLabel?: string;
}) {
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: mapToFormValues(defaultValues),
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues));
  }, [defaultValues, reset]);

  const { data: workerSalesResp } = useSalesWorkerOptions();
  const workerSalesOptions = workerSalesResp?.items ?? [];

  // ✅ Hook local que sí filtra
  const useWorkersLocal = useMemo(
    () => makeLocalUseOptions(workerSalesOptions),
    [workerSalesOptions]
  );

  const { canUseSellerOption } = useCrmAccountsPerms();
  const currentWorkerId = useAuth((s) => s.workerId);

  useEffect(() => {
    if (!canUseSellerOption && currentWorkerId != null) {
      setValue("workerId", Number(currentWorkerId), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, currentWorkerId, setValue]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        const dto: ClientsUpdateChangeSalesDto = {
          clientsId: values.clientsId,
          workerId: values.workerId!,
        };
        onSubmit(dto);
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {canUseSellerOption ? (
          <div className="col-span-full lg:col-span-12 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Vendedor
            </label>

            <Controller
              name="workerId"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SearchSelect
                  key="select-worker"
                  useOptions={useWorkersLocal}
                  value={
                    workerSalesOptions.find(
                      (o: OptionItem) => Number(o.value) === value
                    ) ?? idToOption(value, workerLabel)
                  }
                  onChange={(opt) =>
                    onChange(opt ? Number(opt.value) : undefined)
                  }
                  placeholder="Buscar vendedor…"
                  pageSize={100}
                  minSearchChars={1}
                  className="w-full min-w-0"
                />
              )}
            />

            {errors.workerId && (
              <p className="text-xs text-rose-600">{errors.workerId.message}</p>
            )}
          </div>
        ) : (
          <Controller
            name="workerId"
            control={control}
            render={({ field }) => (
              <input type="hidden" {...field} value={currentWorkerId ?? ""} />
            )}
          />
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!isValid || saving || isSubmitting}
            className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
