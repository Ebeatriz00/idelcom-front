import type { MovementTypesUpsertDto, OptionItem } from "@/application";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { UpperInput } from "@/layouts/presentation/inputs/input";
import { cn } from "@/sharedKernel";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { useMovClasOptions } from "@/sharedKernel/hooks/movs/useMovClas";
import { useMovOperOptions } from "@/sharedKernel/hooks/movs/useMovOper";
import { useMovPerOptions } from "@/sharedKernel/hooks/movs/useMovPer";
import { useMovSunatOptions } from "@/sharedKernel/hooks/movs/useMovSunat";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  FileText,
  Landmark,
  PackageCheck,
  Route,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type FieldError,
  type FieldPath,
  type UseFormSetValue,
} from "react-hook-form";
import { FormSection } from "../../products/components/modal/enterprise/FormSection";
import {
  movementTypesUpsertSchema,
  normalizeMovementLabel,
  type MovementTypesFormValues,
} from "../utils/movementTypes.schema";

type MovementTypesFormProps = {
  defaultValues?: Partial<MovementTypesUpsertDto>;
  onSubmit: (dto: MovementTypesUpsertDto) => void;
  formId?: string;
  autofocus?: boolean;
  movClasLabel?: string;
  movOperLabel?: string;
  movPerLabel?: string;
  movSunatLabel?: string;
  onValidityChange?: (valid: boolean) => void;
};

type SelectFieldName =
  | "movClasId"
  | "movOperId"
  | "movPerId"
  | "movSunatId";

type RhfSearchSelectProps = {
  control: Control<MovementTypesFormValues>;
  setValue: UseFormSetValue<MovementTypesFormValues>;
  name: SelectFieldName;
  label: string;
  placeholder: string;
  useOptions: typeof useMovClasOptions;
  fallbackLabel?: string;
  options: OptionItem[];
  error?: FieldError;
  required?: boolean;
  onSelectedLabel?: (label?: string) => void;
};

function selectedOption(
  value: number | undefined,
  options: OptionItem[],
  fallbackLabel?: string,
) {
  if (value == null) return null;
  return (
    options.find((option) => Number(option.value) === Number(value)) ??
    (fallbackLabel ? { value, label: fallbackLabel } : null)
  );
}

function optionByLabel(options: OptionItem[], label: string) {
  const normalized = normalizeMovementLabel(label);
  return options.find((option) =>
    normalizeMovementLabel(option.label).includes(normalized),
  );
}

function RhfSearchSelect({
  control,
  setValue,
  name,
  label,
  placeholder,
  useOptions,
  fallbackLabel,
  options,
  error,
  required,
  onSelectedLabel,
}: RhfSearchSelectProps) {
  const currentValue = useWatch({ control, name });
  const value = selectedOption(currentValue, options, fallbackLabel);

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <SearchSelect
        useOptions={useOptions}
        value={value}
        onChange={(option) => {
          const nextValue = option ? Number(option.value) : undefined;
          setValue(name, nextValue, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          onSelectedLabel?.(option?.label);
        }}
        placeholder={placeholder}
        pageSize={10}
        className="w-full"
        inputClassName={cn(
          "min-h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-primary/20",
          error && "border-rose-300 focus-within:ring-rose-100",
        )}
      />
      {error && <p className="text-xs font-medium text-rose-600">{error.message}</p>}
    </div>
  );
}

function FieldErrorText({ error }: { error?: FieldError }) {
  if (!error) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{error.message}</p>;
}

function RuleSwitchCard({
  title,
  description,
  checked,
  onChange,
  icon: Icon,
  disabled,
  disabledReason,
  danger,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: typeof PackageCheck;
  disabled?: boolean;
  disabledReason?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "group flex min-h-[112px] w-full items-start justify-between gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200",
        checked
          ? danger
            ? "border-rose-200 bg-rose-50/60"
            : "border-primary/25 bg-primary/5"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <div className="flex min-w-0 gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition",
            checked
              ? danger
                ? "bg-rose-100 text-rose-600 ring-rose-200"
                : "bg-primary/10 text-primary ring-primary/20"
              : "bg-slate-100 text-slate-500 ring-slate-200",
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            {disabled && disabledReason ? disabledReason : description}
          </span>
        </span>
      </div>
      <span
        className={cn(
          "relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
          checked ? (danger ? "bg-rose-500" : "bg-primary") : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function ContextNotice({
  tone = "amber",
  children,
}: {
  tone?: "amber" | "blue" | "slate" | "rose";
  children: React.ReactNode;
}) {
  const styles = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className={cn("flex items-start gap-2 rounded-xl border px-3 py-2 text-xs", styles[tone])}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

export function MovementTypesForm({
  defaultValues,
  onSubmit,
  formId,
  autofocus = true,
  movClasLabel,
  movOperLabel,
  movPerLabel,
  movSunatLabel,
  onValidityChange,
}: MovementTypesFormProps) {
  const movClasQuery = useMovClasOptions(1, "", 100);
  const movOperQuery = useMovOperOptions(1, "", 100);
  const movPerQuery = useMovPerOptions(1, "", 100);
  const movSunatQuery = useMovSunatOptions(1, "", 100);

  const movClasOptions = useSelectOptions(movClasQuery);
  const movOperOptions = useSelectOptions(movOperQuery);
  const movPerOptions = useSelectOptions(movPerQuery);
  const movSunatOptions = useSelectOptions(movSunatQuery);

  const defaultOperationLabel = useMemo(
    () => movOperLabel ?? selectedOption(defaultValues?.movOperId, movOperOptions)?.label,
    [defaultValues?.movOperId, movOperLabel, movOperOptions],
  );

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid },
  } = useForm<MovementTypesFormValues>({
    resolver: zodResolver(movementTypesUpsertSchema),
    mode: "onChange",
    defaultValues: {
      movementTypesId: defaultValues?.movementTypesId,
      code: defaultValues?.code ?? "",
      description: defaultValues?.description ?? "",
      movClasId: defaultValues?.movClasId,
      movOperId: defaultValues?.movOperId,
      movPerId: defaultValues?.movPerId,
      movSunatId: defaultValues?.movSunatId,
      affectsStock: defaultValues?.affectsStock ?? true,
      requiresDestWare: defaultValues?.requiresDestWare ?? false,
      generatesAccounting: defaultValues?.generatesAccounting ?? false,
      allowNegative: defaultValues?.allowNegative ?? false,
      operationLabel: defaultOperationLabel,
    },
  });

  const values = useWatch({ control });
  const operationLabel =
    values.operationLabel ??
    selectedOption(values.movOperId, movOperOptions, movOperLabel)?.label;
  const classificationLabel = selectedOption(
    values.movClasId,
    movClasOptions,
    movClasLabel,
  )?.label;
  const operation = normalizeMovementLabel(operationLabel);
  const classification = normalizeMovementLabel(classificationLabel);

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    if (!operation) return;

    if (["INGRESO", "SALIDA", "TRASLADO", "AJUSTE"].includes(operation)) {
      setValue("affectsStock", true, { shouldValidate: true });
    }

    if (operation === "INGRESO") {
      setValue("requiresDestWare", false, { shouldValidate: true });
      setValue("allowNegative", false, { shouldValidate: true });
    }

    if (operation === "SALIDA") {
      setValue("requiresDestWare", false, { shouldValidate: true });
    }

    if (operation === "TRASLADO") {
      setValue("requiresDestWare", true, { shouldValidate: true });
      const internal = optionByLabel(movPerOptions, "INTERNO");
      if (internal) {
        setValue("movPerId", internal.value, { shouldValidate: true });
      }
    }
  }, [operation, movPerOptions, setValue]);

  useEffect(() => {
    if (!classification) return;

    const setEntity = (label: string) => {
      const option = optionByLabel(movPerOptions, label);
      if (option) setValue("movPerId", option.value, { shouldValidate: true });
    };

    if (classification === "COMPRA") setEntity("PROVEEDOR");
    if (classification === "VENTA") setEntity("CLIENTE");
    if (classification === "CONSUMO") {
      const internal = optionByLabel(movPerOptions, "INTERNO");
      const worker = optionByLabel(movPerOptions, "TRABAJADOR");
      if (internal ?? worker) {
        setValue("movPerId", (internal ?? worker)?.value, { shouldValidate: true });
      }
    }
    if (classification === "TRASLADO") {
      const transfer = optionByLabel(movOperOptions, "TRASLADO");
      if (transfer) {
        setValue("movOperId", transfer.value, { shouldValidate: true });
        setValue("operationLabel", transfer.label, { shouldValidate: true });
      }
      setValue("requiresDestWare", true, { shouldValidate: true });
    }
  }, [classification, movOperOptions, movPerOptions, setValue]);

  useEffect(() => {
    if (!values.affectsStock) {
      setValue("allowNegative", false, { shouldValidate: true });
    }
  }, [setValue, values.affectsStock]);

  useEffect(() => {
    if (!values.requiresDestWare) return;
    const transfer = optionByLabel(movOperOptions, "TRASLADO");
    if (transfer && operation !== "TRASLADO") {
      setValue("movOperId", transfer.value, { shouldValidate: true });
      setValue("operationLabel", transfer.label, { shouldValidate: true });
    }
  }, [movOperOptions, operation, setValue, values.requiresDestWare]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((formValues) => {
        onSubmit({
          movementTypesId: formValues.movementTypesId,
          code: formValues.code.trim(),
          description: formValues.description.trim(),
          movClasId: formValues.movClasId,
          movOperId: formValues.movOperId,
          movPerId: formValues.movPerId,
          movSunatId: formValues.movSunatId,
          affectsStock: formValues.affectsStock,
          requiresDestWare: formValues.requiresDestWare,
          generatesAccounting: formValues.generatesAccounting,
          allowNegative: formValues.allowNegative,
        });
      })}
      className="space-y-5"
    >
      <input type="hidden" {...register("operationLabel")} />

      <FormSection
        title="Informacion basica"
        subtitle="Identifica el tipo de movimiento con un codigo operativo claro."
        icon={FileText}
        tone="slate"
      >
        <div className="lg:col-span-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Codigo <span className="text-rose-500">*</span>
          </label>
          <Controller
            control={control}
            name={"code" as FieldPath<MovementTypesFormValues>}
            render={({ field }) => (
              <UpperInput
                value={String(field.value ?? "")}
                onValueChange={field.onChange}
                placeholder="Ej: TM001"
                maxLength={20}
                autoFocus={autofocus}
                className={cn(
                  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
                  errors.code && "border-rose-300 focus:ring-rose-100",
                )}
              />
            )}
          />
          <FieldErrorText error={errors.code} />
        </div>

        <div className="lg:col-span-8">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Descripcion <span className="text-rose-500">*</span>
          </label>
          <Controller
            control={control}
            name={"description" as FieldPath<MovementTypesFormValues>}
            render={({ field }) => (
              <UpperInput
                value={String(field.value ?? "")}
                onValueChange={field.onChange}
                placeholder="Ej: ENTRADA POR COMPRA"
                maxLength={150}
                className={cn(
                  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
                  errors.description && "border-rose-300 focus:ring-rose-100",
                )}
              />
            )}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <FieldErrorText error={errors.description} />
            <span className="ml-auto text-xs text-slate-400">3 a 150 caracteres</span>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Configuracion funcional"
        subtitle="Define como se interpreta este movimiento en almacen, trazabilidad y SUNAT."
        icon={SlidersHorizontal}
        tone="blue"
      >
        <div className="lg:col-span-6">
          <RhfSearchSelect
            control={control}
            setValue={setValue}
            name="movClasId"
            label="Clasificacion"
            placeholder="Seleccione clasificacion"
            useOptions={useMovClasOptions}
            fallbackLabel={movClasLabel}
            options={movClasOptions}
            error={errors.movClasId}
            required
          />
        </div>

        <div className="lg:col-span-6">
          <RhfSearchSelect
            control={control}
            setValue={setValue}
            name="movOperId"
            label="Operacion"
            placeholder="Seleccione operacion"
            useOptions={useMovOperOptions}
            fallbackLabel={movOperLabel}
            options={movOperOptions}
            error={errors.movOperId}
            required
            onSelectedLabel={(label) =>
              setValue("operationLabel", label, { shouldValidate: true })
            }
          />
        </div>

        <div className="lg:col-span-6">
          <RhfSearchSelect
            control={control}
            setValue={setValue}
            name="movPerId"
            label="Entidad relacionada"
            placeholder="Seleccione entidad relacionada"
            useOptions={useMovPerOptions}
            fallbackLabel={movPerLabel}
            options={movPerOptions}
            error={errors.movPerId}
          />
        </div>

        <div className="lg:col-span-6">
          <RhfSearchSelect
            control={control}
            setValue={setValue}
            name="movSunatId"
            label="Codigo SUNAT"
            placeholder="Seleccione codigo SUNAT"
            useOptions={useMovSunatOptions}
            fallbackLabel={movSunatLabel}
            options={movSunatOptions}
            error={errors.movSunatId}
          />
        </div>
      </FormSection>

      <FormSection
        title="Reglas operativas"
        subtitle="Estas reglas controlan el efecto real del movimiento al registrar operaciones de almacen."
        icon={Boxes}
        tone="emerald"
      >
        <div className="lg:col-span-6">
          <Controller
            control={control}
            name="affectsStock"
            render={({ field }) => (
              <RuleSwitchCard
                title="Afecta stock"
                description="Actualiza existencias del almacen."
                checked={Boolean(field.value)}
                onChange={field.onChange}
                icon={PackageCheck}
              />
            )}
          />
        </div>
        <div className="lg:col-span-6">
          <Controller
            control={control}
            name="requiresDestWare"
            render={({ field }) => (
              <RuleSwitchCard
                title="Requiere almacen destino"
                description="Necesario para traslados entre almacenes."
                checked={Boolean(field.value)}
                onChange={field.onChange}
                icon={Route}
                disabled={operation === "TRASLADO"}
                disabledReason="Obligatorio para operaciones de traslado."
              />
            )}
          />
          <FieldErrorText error={errors.requiresDestWare} />
        </div>
        <div className="lg:col-span-6">
          <Controller
            control={control}
            name="generatesAccounting"
            render={({ field }) => (
              <RuleSwitchCard
                title="Genera asiento contable"
                description="Prepara informacion para contabilidad."
                checked={Boolean(field.value)}
                onChange={field.onChange}
                icon={Landmark}
              />
            )}
          />
        </div>
        <div className="lg:col-span-6">
          <Controller
            control={control}
            name="allowNegative"
            render={({ field }) => (
              <RuleSwitchCard
                title="Permite stock negativo"
                description="No recomendado. Puede generar inconsistencias."
                checked={Boolean(field.value)}
                onChange={field.onChange}
                icon={AlertTriangle}
                disabled={!values.affectsStock}
                disabledReason="Solo disponible cuando el movimiento afecta stock."
                danger
              />
            )}
          />
          <FieldErrorText error={errors.allowNegative} />
        </div>

        <div className="space-y-2 lg:col-span-12">
          {values.allowNegative && (
            <ContextNotice tone="rose">
              Este tipo de movimiento puede dejar stock negativo. Usalo solo con autorizacion.
            </ContextNotice>
          )}
          {values.requiresDestWare && (
            <ContextNotice tone="blue">
              Se solicitara almacen origen y almacen destino al registrar el movimiento.
            </ContextNotice>
          )}
          {!values.affectsStock && (
            <ContextNotice tone="slate">
              Este tipo sera informativo y no cambiara existencias.
            </ContextNotice>
          )}
        </div>
      </FormSection>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <ArrowDownToLine className="mb-1 size-4 text-emerald-600" />
          <p className="text-[11px] font-semibold uppercase text-slate-500">Ingreso</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <ArrowUpFromLine className="mb-1 size-4 text-rose-600" />
          <p className="text-[11px] font-semibold uppercase text-slate-500">Salida</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <ArrowLeftRight className="mb-1 size-4 text-blue-600" />
          <p className="text-[11px] font-semibold uppercase text-slate-500">Traslado</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Wrench className="mb-1 size-4 text-amber-600" />
          <p className="text-[11px] font-semibold uppercase text-slate-500">Ajuste</p>
        </div>
      </div>
    </form>
  );
}
