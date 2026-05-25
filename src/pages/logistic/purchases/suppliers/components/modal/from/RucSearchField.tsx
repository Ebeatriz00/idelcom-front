import { Button } from "@/layouts/components/ui/button";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { Spinner } from "@/layouts/components/ui/loader/spinner";
import { consultRuc } from "@/infrastructure/api-clients/api-peru/ruc.client";
import { showApiError } from "@/sharedKernel";
import { Search, ReceiptText } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  className?: string;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
};

export function RucSearchField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  setValue,
  watch,
}: Props<T>) {
  const [loading, setLoading] = useState(false);
  const documentNumber = watch(name) as string | undefined;

  const handleSearch = async () => {
    if (!documentNumber || documentNumber.length !== 11) return;

    setLoading(true);
    try {
      const data = await consultRuc(documentNumber);
      if (data) {
        // Llenar razon social
        setValue("supplierName" as Path<T>, data.nombreORazonSocial as PathValue<T, Path<T>>, {
          shouldDirty: true,
          shouldValidate: true,
        });
        // Llenar direccion
        setValue("address" as Path<T>, (data.direccionCompleta || data.direccion || "") as PathValue<T, Path<T>>, {
          shouldDirty: true,
          shouldValidate: true,
        });
        // Llenar estado y condicion SUNAT
        setValue("sunatStatus" as Path<T>, data.estado as PathValue<T, Path<T>>, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("sunatCondition" as Path<T>, data.condicion as PathValue<T, Path<T>>, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } catch (error) {
      showApiError(error, "Error al consultar RUC");
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !documentNumber || documentNumber.length !== 11;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={className}>
          <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-gray-700">
            <span>{label}</span>
          </label>
          <div
            className={`flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 ${
              fieldState.error
                ? "border-rose-300 focus-within:border-rose-300 focus-within:ring-rose-100"
                : ""
            }`}
          >
            <div className="relative min-w-0 flex-1">
              <ReceiptText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <UpperInput
                value={(field.value ?? "") as string}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={placeholder}
                onlyNumbers
                maxLength={11}
                className="h-10 w-full border-0 bg-white py-2.5 pl-9 pr-3 text-sm outline-none"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isInvalid || loading}
              isLoading={loading}
              variant="outline"
              aria-label={loading ? "Consultando RUC" : "Buscar RUC"}
              title={loading ? "Consultando RUC" : "Buscar RUC"}
              className="h-10 w-10 shrink-0 rounded-none border-0 border-l border-primary/20 p-0 text-primary hover:bg-primary/5"
            >
              {loading ? (
                <Spinner size="xs" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
          {fieldState.error && (
            <p className="mt-1 text-xs font-medium text-rose-600">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
