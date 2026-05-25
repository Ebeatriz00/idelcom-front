import type { SuppliersUpsertDto } from "@/application";
import {
  useDocumentTypeOptions,
  usePaymentConditionOptions,
} from "@/sharedKernel";
import { usePaymentMethodOptions } from "@/sharedKernel/hooks/logistic/purchases/usePaymentMethod";
import { useSuppliersGroupsOptions } from "@/sharedKernel/hooks/logistic/purchases/useSuppliersGroups";
import { useTypeSuppliersOptions } from "@/sharedKernel/hooks/logistic/purchases/useTypeSuppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Building2,
  Contact,
  CreditCard,
  FileBadge,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Tags,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  useForm,
  type DefaultValues,
  type SubmitHandler,
} from "react-hook-form";

import { AgentsSection } from "./AgentsSection";
import { RucSearchField } from "./from/RucSearchField";
import { SearchSelectRHF } from "./from/SearchSelectRHF";
import { mapToDto, mapToFormValues } from "./from/suppliers.mappers";
import {
  suppliersSchema,
  type SuppliersFormValues,
} from "./from/suppliers.schema";
import { TextFieldRHF } from "./from/TextFieldRHF";
import { UbigeoSection } from "./UbigeoSection";

type Props = {
  defaultValues?: Partial<
    SuppliersUpsertDto & {
      typeSupliersDescription?: string;
      suppliersGroupsDescription?: string;
      documentTypeDescription?: string;
      paymentTypeDescription?: string;
      paymentMethodDescription?: string;
      departmentDescription?: string;
      provinceDescription?: string;
      districtDescription?: string;
    }
  >;
  onSubmit: (dto: SuppliersUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  typeSuppliersLabel?: string;
  suppliersGroupsLabel?: string;
  documentTypeLabel?: string;
  paymentTypeLabel?: string;
  paymentMethodLabel?: string;
};

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  headerActions,
}: {
  icon: typeof Building2;
  title: string;
  subtitle: string;
  children: ReactNode;
  headerActions?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-secondary p-2 text-white">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {headerActions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {headerActions}
          </div>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function FormSnapshot({
  supplierName,
  documentNumber,
  isValid,
}: {
  supplierName?: string;
  documentNumber?: string;
  isValid: boolean;
}) {
  return (
    <aside className="min-h-0 shrink-0 overflow-y-auto rounded-xl border border-secondary/10 bg-secondary p-4 text-white shadow-sm max-xl:max-h-[32vh] xl:h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-white/65">
            Ficha de proveedor
          </p>
          <h2 className="mt-2 break-words text-lg font-semibold leading-snug">
            {supplierName?.trim() || "Nuevo proveedor"}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {documentNumber?.trim() || "Documento pendiente"}
          </p>
        </div>
        <div className="rounded-lg bg-primary p-2 text-white">
          <Building2 className="size-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[11px] uppercase text-white/60">Estado</p>
          <p className="mt-1 text-sm font-semibold">Borrador</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[11px] uppercase text-white/60">Validacion</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            {isValid ? (
              <>
                <BadgeCheck className="size-4 text-accent" />
                Completa
              </>
            ) : (
              "Pendiente"
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-primary/25 bg-primary-degrad/10 p-3">
        <p className="text-xs font-medium text-white">Datos requeridos</p>
        <div className="mt-3 space-y-2 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Identificacion fiscal
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Contacto comercial
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-degrad" />
            Condiciones de compra
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SuppliersForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  departmentLabel: initialDepartmentLabel,
  provinceLabel: initialProvinceLabel,
  districtLabel: initialDistrictLabel,
  typeSuppliersLabel: initialTypeSuppliersLabel,
  suppliersGroupsLabel: initialSuppliersGroupsLabel,
  documentTypeLabel: initialDocumentTypeLabel,
  paymentTypeLabel: initialPaymentTypeLabel,
  paymentMethodLabel: initialPaymentMethodLabel,
}: Props) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SuppliersFormValues>({
    resolver: zodResolver(suppliersSchema),
    mode: "onChange",
    defaultValues: mapToFormValues(
      defaultValues,
    ) as DefaultValues<SuppliersFormValues>,
  });

  useEffect(() => {
    reset(mapToFormValues(defaultValues) as DefaultValues<SuppliersFormValues>);
  }, [defaultValues, reset]);

  const supplierName = watch("supplierName");
  const documentNumber = watch("documentNumber");
  const sunatStatus = watch("sunatStatus");
  const sunatCondition = watch("sunatCondition");

  const { data: typeSuppliersResp } = useTypeSuppliersOptions(1, "", 1000);
  const typeSuppliersOptions = typeSuppliersResp?.items ?? [];

  const { data: suppliersGroupsResp } = useSuppliersGroupsOptions(1, "", 1000);
  const suppliersGroupsOptions = suppliersGroupsResp?.items ?? [];

  const { data: documentTypesResp } = useDocumentTypeOptions(1, "", 1000);
  const documentTypesOptions = documentTypesResp?.items ?? [];

  const { data: paymentTypesResp } = usePaymentConditionOptions(1, "", 1000);
  const paymentTypesOptions = paymentTypesResp?.items ?? [];

  const { data: paymentMethodsResp } = usePaymentMethodOptions(1, "", 1000);
  const paymentMethodsOptions = paymentMethodsResp?.items ?? [];

  const onValidSubmit: SubmitHandler<SuppliersFormValues> = (values) => {
    onSubmit(mapToDto(values));
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onValidSubmit)}
      className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden xl:grid xl:grid-cols-[18rem_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)]"
    >
      <FormSnapshot
        supplierName={supplierName}
        documentNumber={documentNumber}
        isValid={isValid}
      />

      <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-10 pr-1 xl:h-full xl:pr-2">
        <SectionCard
          icon={FileBadge}
          title="Identificacion fiscal"
          subtitle="Datos legales y clasificacion para compras, cuentas por pagar y SUNAT."
          headerActions={
            sunatStatus || sunatCondition ? (
              <>
                {sunatStatus && (
                  <div className="flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    <span className="size-1.5 rounded-full bg-accent" />
                    Estado: {sunatStatus}
                  </div>
                )}
                {sunatCondition && (
                  <div className="flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Condicion: {sunatCondition}
                  </div>
                )}
              </>
            ) : null
          }
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SearchSelectRHF<SuppliersFormValues>
                control={control}
                errors={errors}
                name="supplierTypeId"
                labelName="typeSuppliersLabel"
                label="Tipo de proveedor"
                items={typeSuppliersOptions}
                initialLabel={initialTypeSuppliersLabel}
                watch={watch}
                setValue={setValue}
                placeholder="Seleccionar tipo"
                icon={Tags}
              />
            </div>

            <TextFieldRHF
              control={control}
              name="supplierName"
              label="Razon social"
              placeholder="Ej: PROVEEDOR PRINCIPAL S.A.C."
              className="lg:col-span-4"
              icon={Building2}
            />

            <TextFieldRHF
              control={control}
              name="tradeName"
              label="Nombre comercial"
              placeholder="Ej: PROVEEDOR PRINCIPAL"
              className="lg:col-span-4"
              icon={Building2}
              optional
            />

            <div className="lg:col-span-4">
              <SearchSelectRHF<SuppliersFormValues>
                control={control}
                errors={errors}
                name="documentTypeId"
                labelName="documentTypeLabel"
                label="Tipo de documento"
                items={documentTypesOptions}
                initialLabel={initialDocumentTypeLabel}
                watch={watch}
                setValue={setValue}
                placeholder="Seleccionar documento"
                icon={FileText}
              />
            </div>

            <RucSearchField
              control={control}
              name="documentNumber"
              label="Numero de documento"
              placeholder="Ej: 20601234567"
              className="lg:col-span-4"
              setValue={setValue}
              watch={watch}
            />

            <div className="lg:col-span-4">
              <SearchSelectRHF<SuppliersFormValues>
                control={control}
                errors={errors}
                name="suppliersGroupsId"
                labelName="suppliersGroupsLabel"
                label="Grupo de proveedor"
                items={suppliersGroupsOptions}
                initialLabel={initialSuppliersGroupsLabel}
                watch={watch}
                setValue={setValue}
                placeholder="Seleccionar grupo"
                icon={Landmark}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Contact}
          title="Contacto comercial"
          subtitle="Canales de coordinacion para cotizaciones, entregas y documentacion."
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <TextFieldRHF
              control={control}
              name="contactName"
              label="Contacto principal"
              placeholder="Ej: JUAN PEREZ"
              className="lg:col-span-6"
              icon={Contact}
            />
            <TextFieldRHF
              control={control}
              name="email"
              label="Correo comercial"
              placeholder="Ej: contacto@proveedor.com"
              className="lg:col-span-6"
              icon={Mail}
            />
            <TextFieldRHF
              control={control}
              name="phone"
              label="Telefono"
              className="lg:col-span-6"
              icon={Phone}
              optional
            />
            <TextFieldRHF
              control={control}
              name="movil"
              label="Movil"
              className="lg:col-span-6"
              icon={Smartphone}
              optional
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Condiciones comerciales y de pago"
          subtitle="Define las condiciones comerciales aplicables al proveedor para compras, credito y pagos."
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SearchSelectRHF<SuppliersFormValues>
                control={control}
                errors={errors}
                name="paymentConditionId"
                labelName="paymentTypeLabel"
                label="Tipo de pago"
                items={paymentTypesOptions}
                initialLabel={initialPaymentTypeLabel}
                watch={watch}
                setValue={setValue}
                placeholder="Seleccionar tipo de pago"
                icon={CreditCard}
              />
            </div>

            <div className="lg:col-span-6">
              <SearchSelectRHF<SuppliersFormValues>
                control={control}
                errors={errors}
                name="paymentMethodId"
                labelName="paymentMethodLabel"
                label="Metodo de pago"
                items={paymentMethodsOptions}
                initialLabel={initialPaymentMethodLabel}
                watch={watch}
                setValue={setValue}
                placeholder="Seleccionar metodo"
                icon={WalletIcon}
                optional
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Condiciones tributarias"
          subtitle="Define las condiciones fiscales aplicables al proveedor para compras, retenciones, percepciones y obligaciones tributarias."
        >
          <div className="rounded-lg border border-secondary/10 bg-background p-3">
            <AgentsSection control={control} setValue={setValue} />
          </div>
        </SectionCard>

        <SectionCard
          icon={MapPin}
          title="Ubicacion fiscal"
          subtitle="Direccion y ubigeo para ordenes de compra, facturacion y despachos."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <UbigeoSection
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              initialDepartmentLabel={initialDepartmentLabel}
              initialProvinceLabel={initialProvinceLabel}
              initialDistrictLabel={initialDistrictLabel}
            />
          </div>

          <TextFieldRHF
            control={control}
            name="address"
            label="Direccion fiscal"
            placeholder="Ej: CALLE LAS BRIANAS 145"
            className="mt-3"
            icon={MapPin}
            optional
          />
        </SectionCard>

        {showActions ? (
          <div className="flex items-center justify-end gap-2 rounded-xl border border-gray-200 bg-white p-3">
            <button
              type="submit"
              disabled={!isValid || saving || isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar proveedor"}
            </button>
          </div>
        ) : null}
      </div>
    </form>
  );
}

const WalletIcon = CreditCard;
