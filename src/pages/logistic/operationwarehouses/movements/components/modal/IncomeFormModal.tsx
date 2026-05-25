import type { MovementTypesResponseDto, OptionItem } from "@/application";
import { Modal, SearchSelect } from "@/layouts";
import type { UseOptionsHook } from "@/layouts/components/ui/search-select/types";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { useTaxesOptions } from "@/sharedKernel/hooks/Taxes/useTaxes";
import { useSuppliersOptions } from "@/sharedKernel/hooks/logistic/purchases/useSuppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import type {
  IncomeFormModalProps,
  ProductPickerValue,
} from "../../types/income.types";
import { money } from "../../utils/formatters";
import { detailTotal, mapIncomeFormToDto } from "../../utils/incomes.mappers";
import {
  buildDefaultIncomeValues,
  incomeFormSchema,
  type IncomeFormValues,
} from "../../utils/incomes.schema";
import { parseTaxPercentage } from "../../utils/taxes";
import { ProductSearchPicker } from "../picker/ProductSearchPicker";

function inputClass(hasError?: boolean) {
  return [
    "h-11 w-full rounded-xl border bg-white px-3 text-sm text-secondary outline-none transition focus:ring-2 focus:ring-primary/15",
    hasError ? "border-red-300" : "border-secondary/15 focus:border-primary/50",
  ].join(" ");
}

function compactInputClass(hasError?: boolean) {
  return [
    "h-10 w-full rounded-xl bg-slate-50 px-3 text-center text-sm font-semibold text-secondary outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/15",
    hasError ? "ring-1 ring-red-300" : "ring-1 ring-secondary/10",
  ].join(" ");
}

function numberInputValue(value: string) {
  return value === "" ? undefined : Number(value);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof FileText;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-primary-degrad p-2 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-secondary">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function requiresSupplier(type?: MovementTypesResponseDto) {
  const text = `${type?.description ?? ""} ${type?.code ?? ""}`.toLowerCase();
  return text.includes("compra") || text.includes("proveedor");
}

function emptyDetail(): IncomeFormValues["details"][number] {
  return {
    productsId: 0,
    productLabel: "",
    sku: "",
    barcode: "",
    partNum: "",
    brand: "",
    productType: "",
    currentStock: 0,
    averageCost: 0,
    lastCost: 0,
    manageLots: false,
    manageSerials: false,
    expirationControl: false,
    quantity: 1,
    unitCost: 0,
    lotNumber: "",
    serialNumber: "",
    expirationDate: "",
    observation: "",
  };
}

export function IncomeFormModal({
  open,
  movementTypes,
  warehouses,
  onClose,
  onSubmit,
  saving = false,
}: IncomeFormModalProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [detailPage, setDetailPage] = useState(0);
  const detailPageSize = 10;
  const suppliersQuery = useSuppliersOptions(1, "", 1000);
  const suppliers = suppliersQuery.data?.items ?? [];
  const taxesQuery = useTaxesOptions(1, "", 1000);
  const taxes = useSelectOptions(taxesQuery);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    mode: "onChange",
    defaultValues: buildDefaultIncomeValues(),
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "details",
  });

  const movementTypeId = useWatch({ control, name: "movementTypeId" });
  const warehouseId = useWatch({ control, name: "warehouseId" });
  const taxesId = useWatch({ control, name: "taxesId" });
  const watchedDetails = useWatch({ control, name: "details" });
  const details = useMemo(() => watchedDetails ?? [], [watchedDetails]);

  const selectedType = useMemo(
    () => movementTypes.find((item) => item.movementTypesId === movementTypeId),
    [movementTypeId, movementTypes],
  );
  const supplierRequired = requiresSupplier(selectedType);
  const movementTypeOptions = useMemo<OptionItem[]>(
    () =>
      movementTypes.map((item) => ({
        value: item.movementTypesId ?? 0,
        label: item.description ?? item.code ?? `Tipo ${item.movementTypesId}`,
      })),
    [movementTypes],
  );
  const movementTypeUseOptions = useMemo<UseOptionsHook>(
    () => (page = 1, search = "", pageSize = 100) => {
      const term = search.trim().toLowerCase();
      const filtered = term
        ? movementTypeOptions.filter((option) =>
            option.label.toLowerCase().includes(term),
          )
        : movementTypeOptions;
      const safePage = Math.max(1, page);
      const safeSize = Math.max(1, pageSize);
      const start = (safePage - 1) * safeSize;

      return {
        data: {
          items: filtered.slice(start, start + safeSize),
          page: safePage,
          pageSize: safeSize,
          hasMore: start + safeSize < filtered.length,
        },
        isLoading: false,
        isFetching: false,
        refetch: () => undefined,
      };
    },
    [movementTypeOptions],
  );
  const selectedTax = useMemo(
    () => taxes.find((item) => Number(item.value) === taxesId) ?? null,
    [taxes, taxesId],
  );
  const supplierOptionsHook = useMemo<UseOptionsHook>(
    () => (page = 1, search = "", pageSize = 100) => {
      const term = search.trim().toLowerCase();
      const filtered = term
        ? suppliers.filter((option) => option.label.toLowerCase().includes(term))
        : suppliers;
      const safePage = Math.max(1, page);
      const safeSize = Math.max(1, pageSize);
      const start = (safePage - 1) * safeSize;

      return {
        data: {
          items: filtered.slice(start, start + safeSize),
          page: safePage,
          pageSize: safeSize,
          hasMore: start + safeSize < filtered.length,
        },
        isLoading: suppliersQuery.isLoading,
        isFetching: suppliersQuery.isFetching,
        refetch: () => undefined,
      };
    },
    [suppliers, suppliersQuery.isFetching, suppliersQuery.isLoading],
  );

  useEffect(() => {
    setValue("requiresSupplier", supplierRequired, { shouldValidate: true });
    if (!supplierRequired) {
      setValue("suppliersId", undefined, { shouldValidate: true });
    }
  }, [setValue, supplierRequired]);

  useEffect(() => {
    if (!open) return;

    reset(buildDefaultIncomeValues());
    setDetailPage(0);
    setExpandedNotes(new Set());
  }, [open, reset]);

  // Preview visual only.
  // Backend recalculates official financial values.
  const subTotalPreview = useMemo(
    () =>
      details.reduce(
        (sum, item) =>
          sum +
          detailTotal(Number(item?.quantity ?? 0), Number(item?.unitCost ?? 0)),
        0,
      ),
    [details],
  );
  const taxPercent = parseTaxPercentage(selectedTax);
  const igvAmountPreview = Number(
    ((subTotalPreview * taxPercent) / 100).toFixed(2),
  );
  const totalPreview = Number((subTotalPreview + igvAmountPreview).toFixed(2));
  const itemsCount = details.filter((item) => item.productsId > 0).length;
  const detailPageCount = Math.max(1, Math.ceil(fields.length / detailPageSize));
  const visibleFields = fields.slice(
    detailPage * detailPageSize,
    detailPage * detailPageSize + detailPageSize,
  );
  const firstVisibleDetail = fields.length === 0 ? 0 : detailPage * detailPageSize + 1;
  const lastVisibleDetail = Math.min(
    fields.length,
    detailPage * detailPageSize + visibleFields.length,
  );

  function selectProduct(index: number, product: ProductPickerValue) {
    setValue(`details.${index}.productsId`, product.productsId, {
      shouldValidate: true,
    });
    setValue(`details.${index}.productLabel`, product.productLabel);
    setValue(`details.${index}.sku`, product.sku);
    setValue(`details.${index}.barcode`, product.barcode);
    setValue(`details.${index}.partNum`, product.partNum);
    setValue(`details.${index}.brand`, product.brand);
    setValue(`details.${index}.productType`, product.productType);
    setValue(`details.${index}.currentStock`, product.currentStock);
    setValue(`details.${index}.averageCost`, product.averageCost);
    setValue(`details.${index}.lastCost`, product.lastCost);
    setValue(`details.${index}.manageLots`, Boolean(product.manageLots), {
      shouldValidate: true,
    });
    setValue(`details.${index}.manageSerials`, Boolean(product.manageSerials), {
      shouldValidate: true,
    });
    setValue(
      `details.${index}.expirationControl`,
      Boolean(product.expirationControl),
      { shouldValidate: true },
    );
    setValue(`details.${index}.unitCost`, Number(product.lastCost ?? 0), {
      shouldValidate: true,
    });
  }

  function toggleNote(rowId: string) {
    setExpandedNotes((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function addDetailLine() {
    prepend(emptyDetail());
    setDetailPage(0);

    
  }

  function removeDetailLine(index: number) {
    remove(index);
    setDetailPage((current) => {
      const nextTotal = Math.max(0, fields.length - 1);
      const nextPageCount = Math.max(1, Math.ceil(nextTotal / detailPageSize));
      return Math.min(current, nextPageCount - 1);
    });
  }

  if (!open) return null;

  return (
    <Modal
      size="full"
      onClose={onClose}
      closeOnBackdrop={false}
      title={
        <div className="flex items-center gap-3">
          <span>Nuevo ingreso</span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            INGRESO
          </span>
        </div>
      }
      subtitle="Registra entrada fisica de productos al almacen."
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-secondary/10 bg-white px-6 py-5"
      contentClassName="overflow-hidden rounded-[28px] border border-white/70 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.55)]"
      bodyClassName="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-6"
      footerClassName="sticky bottom-0 z-20 flex shrink-0 items-center justify-between gap-4 border-t border-secondary/10 bg-white/95 px-6 py-4 backdrop-blur"
      closeButtonClassName="ml-auto rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-secondary"
      footer={
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Items
              </p>
              <p className="font-semibold text-secondary">{itemsCount}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Subtotal
              </p>
              <p className="font-semibold text-secondary">
                {money(subTotalPreview)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                IGV ({taxPercent}%)
              </p>
              <p className="font-semibold text-secondary">
                {money(igvAmountPreview)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Total
              </p>
              <p className="text-lg font-bold text-primary">
                {money(totalPreview)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-secondary/15 bg-white px-4 text-sm font-semibold text-secondary transition hover:bg-muted"
            >
              <X className="size-4" />
              Cancelar
            </button>
            <button
              type="submit"
              form="income-form"
              disabled={!isValid || saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar ingreso
            </button>
          </div>
        </>
      }
    >
      <form
        id="income-form"
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(mapIncomeFormToDto(values));
        })}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <Section
              title="Informacion del ingreso"
              subtitle="Datos operativos que determinan como se registrara el movimiento."
              icon={PackagePlus}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
                  <label className="space-y-1.5 xl:col-span-6">
                    <Label>Tipo de ingreso</Label>
                    <Controller
                      control={control}
                      name="movementTypeId"
                      render={({ field }) => {
                        const selected =
                          movementTypeOptions.find(
                            (option) => Number(option.value) === field.value,
                          ) ?? null;

                        return (
                          <SearchSelect
                            useOptions={movementTypeUseOptions}
                            value={selected}
                            onChange={(option) =>
                              field.onChange(option ? Number(option.value) : 0)
                            }
                            placeholder="Buscar tipo de ingreso..."
                            pageSize={100}
                            minSearchChars={0}
                            className="w-full"
                            inputClassName={[
                              "h-11 rounded-xl border px-3 text-sm shadow-none",
                              errors.movementTypeId
                                ? "border-red-300 bg-red-50/30"
                                : "border-secondary/15 bg-white hover:border-primary/40",
                            ].join(" ")}
                            textClassName="font-medium text-secondary placeholder:text-muted-foreground"
                          />
                        );
                      }}
                    />
                    <FieldError message={errors.movementTypeId?.message} />
                  </label>

                  <label className="space-y-1.5 xl:col-span-3">
                    <Label>Almacen</Label>
                    <select
                      className={inputClass(!!errors.warehouseId)}
                      {...register("warehouseId", { valueAsNumber: true })}
                    >
                      <option value={0}>Seleccione...</option>
                      {warehouses.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.warehouseId?.message} />
                  </label>

                  <label className="space-y-1.5 xl:col-span-3">
                    <Label>Fecha</Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input
                        type="date"
                        className={`${inputClass(!!errors.movementDate)} pl-9`}
                        {...register("movementDate")}
                      />
                    </div>
                    <FieldError message={errors.movementDate?.message} />
                  </label>

                </div>

                {supplierRequired ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
                    <label className="space-y-1.5 xl:col-span-6">
                      <Label>Proveedor</Label>
                      <Controller
                        control={control}
                        name="suppliersId"
                        render={({ field }) => {
                          const selectedSupplier =
                            suppliers.find(
                              (option) => Number(option.value) === field.value,
                            ) ?? null;

                          return (
                            <SearchSelect
                              useOptions={supplierOptionsHook}
                              value={selectedSupplier}
                              onChange={(option) =>
                                field.onChange(
                                  option ? Number(option.value) : undefined,
                                )
                              }
                              placeholder="Buscar proveedor..."
                              pageSize={100}
                              minSearchChars={0}
                              className="w-full"
                              inputClassName={[
                                "h-11 rounded-xl border px-3 text-sm shadow-none",
                                errors.suppliersId
                                  ? "border-red-300 bg-red-50/30"
                                  : "border-secondary/15 bg-white hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15",
                              ].join(" ")}
                              textClassName="font-medium text-secondary placeholder:text-muted-foreground"
                            />
                          );
                        }}
                      />
                      <FieldError message={errors.suppliersId?.message} />
                    </label>
                    <label className="space-y-1.5 xl:col-span-6">
                      <Label>Impuesto</Label>
                      <Controller
                        control={control}
                        name="taxesId"
                        render={({ field }) => (
                          <SearchSelect
                            useOptions={useTaxesOptions}
                            value={selectedTax}
                            onChange={(option) =>
                              field.onChange(
                                option ? Number(option.value) : undefined,
                              )
                            }
                            placeholder="Buscar impuesto..."
                            pageSize={20}
                            minSearchChars={0}
                            className="w-full"
                            inputClassName="h-11 rounded-xl border border-secondary/15 bg-white px-3 text-sm shadow-none hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15"
                            textClassName="font-medium text-secondary placeholder:text-muted-foreground"
                            renderOption={(option) => (
                              <div className="flex min-w-0 items-center justify-between gap-3">
                                <span className="truncate">{option.label}</span>
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                  {parseTaxPercentage(option)}%
                                </span>
                              </div>
                            )}
                          />
                        )}
                      />
                      <p className="text-xs font-medium text-muted-foreground">
                        Vista previa solamente. El backend recalcula los valores oficiales.
                      </p>
                    </label>
                  </div>
                ) : null}
              </div>

              {selectedType?.affectsStock ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Este ingreso actualizara el stock y generara kardex.
                </div>
              ) : null}
              {selectedType?.generatesAccounting ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Sparkles className="size-3.5" />
                  Genera contabilidad
                </div>
              ) : null}
            </Section>

            <Section
              title="Productos ingresados"
              subtitle="Agrega los productos fisicos, cantidades y costos de entrada."
              icon={PackagePlus}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {fields.length} linea{fields.length === 1 ? "" : "s"} en el ingreso
                </div>
                <button
                  type="button"
                  onClick={addDetailLine}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/20 bg-white px-3 text-sm font-semibold text-primary transition hover:bg-primary-degrad"
                >
                  <Plus className="size-4" />
                  Agregar producto
                </button>
              </div>

              {errors.details?.root?.message ? (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="size-4" />
                  {errors.details.root.message}
                </div>
              ) : null}

              {fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-secondary/20 bg-muted/40 px-6 py-12 text-center">
                  <PackagePlus className="mx-auto mb-3 size-10 text-muted-foreground/60" />
                  <p className="font-semibold text-secondary">
                    Agrega productos para registrar el ingreso
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleFields.map((field, visibleIndex) => {
                    const index = detailPage * detailPageSize + visibleIndex;
                    const detail = details[index];
                    const rowTotal = detailTotal(
                      Number(detail?.quantity ?? 0),
                      Number(detail?.unitCost ?? 0),
                    );
                    const pickerValue =
                      detail?.productsId > 0
                        ? {
                            productsId: detail.productsId,
                            productLabel: detail.productLabel ?? "",
                            sku: detail.sku,
                            barcode: detail.barcode,
                            partNum: detail.partNum,
                            brand: detail.brand,
                            productType: detail.productType,
                            currentStock: detail.currentStock,
                            averageCost: detail.averageCost,
                            lastCost: detail.lastCost,
                            manageLots: detail.manageLots,
                            manageSerials: detail.manageSerials,
                            expirationControl: detail.expirationControl,
                          }
                        : null;
                    const noteOpen = expandedNotes.has(field.id);

                    return (
                      <div
                        key={field.id}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-primary/60 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <Controller
                              control={control}
                              name={`details.${index}.productsId`}
                              render={() => (
                                <ProductSearchPicker
                                  value={pickerValue}
                                  warehouseId={warehouseId}
                                  error={
                                    errors.details?.[index]?.productsId?.message
                                  }
                                  onChange={(product) =>
                                    selectProduct(index, product)
                                  }
                                />
                              )}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDetailLine(index)}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                            title="Eliminar producto"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                          <label className="space-y-1.5">
                            <Label>Cantidad</Label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className={compactInputClass(
                                !!errors.details?.[index]?.quantity,
                              )}
                              {...register(`details.${index}.quantity`, {
                                setValueAs: numberInputValue,
                              })}
                            />
                            <FieldError
                              message={errors.details?.[index]?.quantity?.message}
                            />
                          </label>

                          <label className="space-y-1.5">
                            <Label>Costo unit.</Label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className={compactInputClass(
                                !!errors.details?.[index]?.unitCost,
                              )}
                              {...register(`details.${index}.unitCost`, {
                                setValueAs: numberInputValue,
                              })}
                            />
                            <FieldError
                              message={errors.details?.[index]?.unitCost?.message}
                            />
                          </label>

                          <div className="space-y-1.5">
                            <Label>Total</Label>
                            <div className="flex h-10 items-center justify-center rounded-xl bg-orange-50 px-3 text-sm font-bold text-orange-600 ring-1 ring-orange-100 transition group-hover:bg-orange-100">
                              {money(rowTotal)}
                            </div>
                          </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {detail?.manageLots ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Requiere lote
                            </span>
                          ) : null}
                          {detail?.manageSerials ? (
                            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                              Requiere serie
                            </span>
                          ) : null}
                          {detail?.expirationControl ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Requiere vencimiento
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => toggleNote(field.id)}
                            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-secondary"
                          >
                            Observacion
                            <ChevronDown
                              className={`size-3.5 transition ${
                                noteOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {(detail?.manageLots ||
                          detail?.manageSerials ||
                          detail?.expirationControl) && (
                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                          {detail?.manageLots ? (
                            <label className="space-y-1.5">
                              <Label>Lote</Label>
                              <input
                                className={compactInputClass(
                                  !!errors.details?.[index]?.lotNumber,
                                )}
                                {...register(`details.${index}.lotNumber`)}
                              />
                              <FieldError
                                message={
                                  errors.details?.[index]?.lotNumber?.message
                                }
                              />
                            </label>
                          ) : null}

                          {detail?.manageSerials ? (
                            <label className="space-y-1.5">
                              <Label>Serie</Label>
                              <input
                                className={compactInputClass(
                                  !!errors.details?.[index]?.serialNumber,
                                )}
                                {...register(`details.${index}.serialNumber`)}
                              />
                              <FieldError
                                message={
                                  errors.details?.[index]?.serialNumber?.message
                                }
                              />
                            </label>
                          ) : null}

                          {detail?.expirationControl ? (
                            <label className="space-y-1.5">
                              <Label>Vencimiento</Label>
                              <input
                                type="date"
                                className={compactInputClass(
                                  !!errors.details?.[index]?.expirationDate,
                                )}
                                {...register(`details.${index}.expirationDate`)}
                              />
                              <FieldError
                                message={
                                  errors.details?.[index]?.expirationDate
                                    ?.message
                                }
                              />
                            </label>
                          ) : null}
                          </div>
                        )}

                        {noteOpen ? (
                          <div className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-secondary/10">
                            <label className="space-y-1.5">
                              <Label>Observacion de linea</Label>
                              <input
                                className="h-10 w-full rounded-xl bg-white px-3 text-sm text-secondary outline-none ring-1 ring-secondary/10 transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/15"
                                placeholder="Detalle operativo, estado de recepcion o nota interna..."
                                {...register(`details.${index}.observation`)}
                              />
                            </label>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {fields.length > detailPageSize ? (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-secondary/10 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Mostrando {firstVisibleDetail}-{lastVisibleDetail} de{" "}
                    {fields.length} productos
                  </p>
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailPage((page) => Math.max(0, page - 1))}
                      disabled={detailPage === 0}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-secondary/15 bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </button>
                    <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-secondary/10">
                      {detailPage + 1} / {detailPageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDetailPage((page) =>
                          Math.min(detailPageCount - 1, page + 1),
                        )
                      }
                      disabled={detailPage >= detailPageCount - 1}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-secondary/15 bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </Section>
          </div>

          <div className="space-y-5 xl:col-span-4">
            <Section
              title="Documento de referencia"
              subtitle="Datos documentarios asociados al ingreso."
              icon={FileText}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <Label>Serie</Label>
                  <input
                    className={inputClass(!!errors.series)}
                    {...register("series")}
                    placeholder="F001"
                  />
                  <FieldError message={errors.series?.message} />
                </label>
                <label className="space-y-1.5">
                  <Label>Numero</Label>
                  <input
                    className={inputClass(!!errors.numberDocument)}
                    {...register("numberDocument")}
                    placeholder="000123"
                  />
                  <FieldError message={errors.numberDocument?.message} />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <Label>Referencia</Label>
                  <input
                    className={inputClass(!!errors.referenceDocument)}
                    {...register("referenceDocument")}
                    placeholder="Orden, guia o referencia interna"
                  />
                  <FieldError message={errors.referenceDocument?.message} />
                </label>
              </div>
            </Section>

            <Section
              title="Observacion"
              subtitle="Notas visibles para revision logistica."
              icon={Info}
            >
              <textarea
                rows={6}
                className="w-full resize-none rounded-2xl border border-secondary/15 bg-white px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                placeholder="Agrega indicaciones, condiciones de recepcion o comentarios internos..."
                {...register("observation")}
              />
            </Section>
          </div>
        </div>
      </form>
    </Modal>
  );
}
