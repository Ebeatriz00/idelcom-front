import type { OptionItem } from "@/application";
import { useEffect } from "react";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { idToOption, type ClientsFormValues } from "./clients.schema";
import { RHFSearchSelect } from "./RHFSearchSelect";

export function SellerSection({
  control,
  watch,
  setValue,
  canUseSellerOption,
  currentWorkerId,
  workerSalesOptions,
  useWorkerSales,
  workerLabel,
}: {
  control: Control<ClientsFormValues>;
  watch: UseFormWatch<ClientsFormValues>;
  setValue: UseFormSetValue<ClientsFormValues>;
  canUseSellerOption: boolean;
  currentWorkerId: number | string | null | undefined;
  workerSalesOptions: OptionItem[];
  useWorkerSales: any;
  workerLabel?: string;
}) {
  const workerId = watch("workerId");

  // 🔒 Si NO tiene permiso, forzamos el workerId del usuario logueado.
  useEffect(() => {
    if (!canUseSellerOption) {
      const resolved = currentWorkerId != null ? Number(currentWorkerId) : null;

      // si aún no hay worker en sesión, no hacemos nada (evita setValue con NaN)
      if (resolved == null || Number.isNaN(resolved)) return;

      // si ya está bien seteado, no repitas
      if (workerId === resolved) return;

      setValue("workerId", resolved, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, currentWorkerId, workerId, setValue]);

  // 🚫 No tiene permiso => NO mostrar select, solo hidden
  if (!canUseSellerOption) {
    return (
      <Controller
        name="workerId"
        control={control}
        render={({ field }) => (
          <input
            type="hidden"
            {...field}
            value={currentWorkerId != null ? String(currentWorkerId) : ""}
          />
        )}
      />
    );
  }

  // ✅ Sí tiene permiso => mostrar select normal
  return (
    <div className="col-span-full lg:col-span-12">
      <RHFSearchSelect
        control={control}
        name="workerId"
        label="Vendedor"
        useOptions={useWorkerSales}
        value={
          workerSalesOptions.find((o) => Number(o.value) === workerId) ??
          idToOption(workerId, workerLabel)
        }
        onChangeValue={(opt) =>
          setValue("workerId", opt ? Number(opt.value) : undefined, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        placeholder="Buscar vendedor…"
        pageSize={100}
        minSearchChars={1}
      />
    </div>
  );
}
