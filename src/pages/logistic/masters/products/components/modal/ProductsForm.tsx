import {
  useBrandsOptions,
  useCategoriesOptions,
  useProductLinesOptions,
  useProductTypesOptions,
  cn,
} from "@/sharedKernel";
import { useUomOptions } from "@/sharedKernel/hooks/general/useUom";
import { useSelectOptions } from "@/sharedKernel/hooks/SelectOptions/useSelectOptions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { buildDefaultValues } from "../../utils/buildDefaultValues";
import {
  productsUpsertSchema,
  type ProductsUpsertFormValues,
} from "../../utils/products.schema";
import type { PropsForm } from "../../utils/products.type";
import { useProductCatalogRules } from "../../utils/useProductCatalogRules";
import { RHFImageDropzone } from "./RHFImageDropzone";
import { RHFSwitch } from "./RHFSwitch";
import {
  FormInput,
  FormNumber,
  FormTextarea,
  FormSection,
  FormHelp,
  FormSearchSelect,
} from "./ProductEnterpriseComponents";
import {
  Package,
  Tags,
  Settings,
  Image as ImageIcon,
  ShoppingCart,
  Boxes,
  Wrench,
  Power,
  DollarSign,
  Briefcase,
  Layers,
  Barcode,
  Calendar,
  RotateCcw,
  Info,
  Save,
  Loader2,
} from "lucide-react";

export function ProductsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  categoriesLabel,
  productLinesLabel,
  brandsLabel,
  productTypesLabel,
  uomLabel,
}: PropsForm) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<ProductsUpsertFormValues>({
    resolver: zodResolver(productsUpsertSchema),
    mode: "onChange",
    defaultValues: buildDefaultValues(defaultValues),
  });

  const productsId = useWatch({ control, name: "productsId" });
  const selectedCategoryId = useWatch({ control, name: "categoriesId" });
  const isService = useWatch({ control, name: "isServices" });
  const rules = useProductCatalogRules({ control, setValue });

  useEffect(() => {
    reset(buildDefaultValues(defaultValues));
  }, [defaultValues, reset]);

  const categoriesQuery = useCategoriesOptions();
  const categoriesOptions = useSelectOptions(categoriesQuery);

  const productLinesQuery = useProductLinesOptions(
    selectedCategoryId,
    1,
    "",
    1000,
    { enabled: Boolean(selectedCategoryId) },
  );
  const productLinesOptions = useSelectOptions(productLinesQuery);

  const brandsQuery = useBrandsOptions();
  const brandsOptions = useSelectOptions(brandsQuery);

  const productTypesQuery = useProductTypesOptions();
  const productTypesOptions = useSelectOptions(productTypesQuery);

  const uomQuery = useUomOptions();
  const uomOptions = useSelectOptions(uomQuery);

  useEffect(() => {
    if (
      selectedCategoryId &&
      defaultValues?.categoriesId !== selectedCategoryId
    ) {
      setValue("productLinesId", undefined, { shouldValidate: true });
    }
  }, [selectedCategoryId, setValue, defaultValues?.categoriesId]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="relative space-y-8 pb-20">
      
      {/* Sección 1: Identificación y Clasificación */}
      <FormSection
        title="Información Principal"
        subtitle="Define la identidad básica y clasificación del producto en el catálogo."
        icon={Package}
        tone="blue"
      >
        <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FormSearchSelect<ProductsUpsertFormValues>
            name="productTypeId"
            control={control}
            label="Tipo de producto"
            options={productTypesOptions}
            fallbackLabel={productTypesLabel}
            placeholder="Seleccione el tipo..."
            required
          />
          <FormSearchSelect<ProductsUpsertFormValues>
            name="categoriesId"
            control={control}
            label="Categoría"
            options={categoriesOptions}
            fallbackLabel={categoriesLabel}
            placeholder="Seleccione categoría..."
            required
          />
          <FormSearchSelect<ProductsUpsertFormValues>
            name="productLinesId"
            control={control}
            label="Línea de producto"
            options={productLinesOptions}
            fallbackLabel={productLinesLabel}
            disabled={!selectedCategoryId}
            placeholder={
              productLinesQuery.isFetching ? "Cargando..." : "Seleccione línea..."
            }
            required
          />
        </div>

        <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormSearchSelect<ProductsUpsertFormValues>
            name="brandsId"
            control={control}
            label="Marca"
            options={brandsOptions}
            fallbackLabel={brandsLabel}
            placeholder="Seleccione marca..."
            required
          />
          <FormSearchSelect<ProductsUpsertFormValues>
            name="uomId"
            control={control}
            label="Unidad de medida"
            options={uomOptions}
            fallbackLabel={uomLabel}
            placeholder="Seleccione unidad..."
            required
          />
        </div>

        <div className="col-span-full grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FormInput<ProductsUpsertFormValues>
            name="sku"
            control={control}
            label="SKU"
            placeholder="Ej: ART-001"
            description="Identificador interno"
          />
          <FormInput<ProductsUpsertFormValues>
            name="barcode"
            control={control}
            label="Código de barras"
            placeholder="EAN-13 / UPC"
            description="Escaneo logístico"
          />
          <FormInput<ProductsUpsertFormValues>
            name="partNum"
            control={control}
            label="Número de parte"
            placeholder="P/N-12345"
            description="Referencia fabricante"
          />
        </div>

        <div className="col-span-full space-y-6">
          <FormTextarea<ProductsUpsertFormValues>
            name="description"
            control={control}
            label="Descripción Principal"
            placeholder="Nombre detallado y descriptivo del producto..."
            rows={2}
            maxLength={200}
            showCount
          />
          <FormInput<ProductsUpsertFormValues>
            name="shortDescription"
            control={control}
            label="Nombre Comercial (Corto)"
            placeholder="Nombre optimizado para tickets y facturas..."
          />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Sección 2: Configuración (Switches) */}
        <div className="lg:col-span-7 space-y-10">
          <FormSection
            title="Configuración Operativa"
            subtitle="Establece cómo se comporta el producto en los diferentes módulos del ERP."
            icon={Settings}
            className="h-full"
            tone="slate"
          >
            <div className="col-span-full space-y-8">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <Power className="size-3" />
                  Estado del Sistema
                </h3>
                <RHFSwitch
                  name="isActive"
                  control={control}
                  label="Producto Activo"
                  description="Habilita el uso de este producto en órdenes, almacenes y ventas."
                  icon={<Power className="size-4" />}
                />
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <ShoppingCart className="size-3" />
                  Reglas Comerciales
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RHFSwitch
                    name="canBuy"
                    control={control}
                    label="Se compra"
                    description="Permite incluirlo en Órdenes de Compra."
                    icon={<ShoppingCart className="size-4" />}
                  />
                  <RHFSwitch
                    name="canSell"
                    control={control}
                    label="Se vende"
                    description="Permite seleccionarlo en Facturación y Ventas."
                    disabled={rules.disabled.canSell}
                    disabledReason="Las herramientas de uso interno no están disponibles para la venta."
                    icon={<DollarSign className="size-4" />}
                  />
                  <div className="col-span-full">
                    <RHFSwitch
                      name="isServices"
                      control={control}
                      label="Es un Servicio"
                      description="Los servicios son bienes intangibles y no manejan stock físico."
                      icon={<Briefcase className="size-4" />}
                    />
                  </div>
                </div>
              </div>

              {isService && (
                <FormHelp tone="blue">
                  Has marcado este producto como <strong>Servicio</strong>. Esto deshabilitará automáticamente las opciones de inventario físico, control de lotes y almacenamiento.
                </FormHelp>
              )}

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <Boxes className="size-3" />
                  Control de Inventario
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RHFSwitch
                    name="isStockable"
                    control={control}
                    label="Inventariable"
                    description="Controla existencias en almacenes físicos."
                    disabled={rules.disabled.isStockable}
                    disabledReason={
                      rules.isServices
                        ? "Un servicio no puede tener stock físico."
                        : "Las herramientas siempre deben ser inventariables."
                    }
                    icon={<Package className="size-4" />}
                  />
                  <RHFSwitch
                    name="manageLots"
                    control={control}
                    label="Gestión de Lotes"
                    description="Trazabilidad por grupos de producción."
                    disabled={rules.disabled.manageLots}
                    disabledReason="Solo disponible para productos inventariables físicos."
                    icon={<Layers className="size-4" />}
                  />
                  <RHFSwitch
                    name="manegesSerials"
                    control={control}
                    label="Números de Serie"
                    description="Seguimiento individual único por unidad."
                    disabled={rules.disabled.manegesSerials}
                    disabledReason="Solo disponible para productos inventariables físicos."
                    icon={<Barcode className="size-4" />}
                  />
                  <RHFSwitch
                    name="expirationControl"
                    control={control}
                    label="Vencimiento"
                    description="Control de fechas de caducidad."
                    disabled={rules.disabled.expirationControl}
                    disabledReason={
                      rules.isServices
                        ? "Los servicios no tienen fecha de caducidad."
                        : "Requiere activar Gestión de Lotes primero."
                    }
                    icon={<Calendar className="size-4" />}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <Wrench className="size-3" />
                  Activos e Internos
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RHFSwitch
                    name="isTool"
                    control={control}
                    label="Herramienta"
                    description="Marcado como activo para uso operativo interno."
                    icon={<Wrench className="size-4" />}
                  />
                  <RHFSwitch
                    name="isReturnable"
                    control={control}
                    label="Retornable"
                    description="Debe registrarse su devolución tras el uso."
                    disabled={rules.disabled.isReturnable}
                    disabledReason="Todas las herramientas se consideran retornables por defecto."
                    icon={<RotateCcw className="size-4" />}
                  />
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        {/* Sección 3: Imagen y Logística */}
        <div className="lg:col-span-5 space-y-10">
          {!productsId && (
            <FormSection
              title="Multimedia"
              subtitle="Sube imágenes representativas del producto."
              icon={ImageIcon}
              tone="emerald"
            >
              <div className="col-span-full">
                <RHFImageDropzone
                  name="files"
                  control={control}
                  label="Galería de Imágenes"
                />
              </div>
            </FormSection>
          )}

          <FormSection
            title="Logística y Dimensiones"
            subtitle="Parámetros críticos para almacenamiento y transporte."
            icon={Tags}
            tone="amber"
          >
            <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormNumber<ProductsUpsertFormValues>
                name="stockMin"
                disabled={rules.disabled.stockRange}
                control={control}
                label="Stock Mínimo"
                placeholder="0"
              />
              <FormNumber<ProductsUpsertFormValues>
                name="stockMax"
                disabled={rules.disabled.stockRange}
                control={control}
                label="Stock Máximo"
                placeholder="0"
              />
              <FormNumber<ProductsUpsertFormValues>
                name="weight"
                disabled={rules.disabled.logisticsSize}
                control={control}
                label="Peso (kg)"
                step={0.01}
                placeholder="0.00"
              />
              <FormNumber<ProductsUpsertFormValues>
                name="volume"
                disabled={rules.disabled.logisticsSize}
                control={control}
                label="Volumen (m³)"
                step={0.01}
                placeholder="0.00"
              />
            </div>

            {(rules.disabled.stockRange || rules.disabled.logisticsSize) && (
              <div className="col-span-full flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-amber-800">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  {rules.disabled.logisticsSize
                    ? "Los campos de peso, volumen y stock están inhabilitados porque el producto es un servicio."
                    : "Los límites de stock están inhabilitados porque el producto no es inventariable."}
                </p>
              </div>
            )}
          </FormSection>
        </div>
      </div>

      {showActions && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-end gap-3 border-t border-gray-100 bg-white/80 p-6 backdrop-blur-md lg:absolute lg:-mx-6 lg:-mb-6 lg:rounded-b-3xl">
          <div className="flex w-full max-w-4xl items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!isValid || saving || isSubmitting}
              className={cn(
                "group relative inline-flex min-w-[200px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
                (saving || isSubmitting) && "bg-blue-700"
              )}
            >
              {saving || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando solicitud...</span>
                </>
              ) : (
                <>
                  <Save className="size-4 transition-transform group-hover:scale-110" />
                  <span>{productsId ? "Actualizar Producto" : "Registrar Producto"}</span>
                </>
              )}
              
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
