import type { ContactsUpsertDto } from "@/application/dtos/crm/contacts/Contacts.dto";
import type { ContactsFormValues } from "./form/contacts.schema";
import { SearchSelectRHF } from "./form/SearchSelectRHF";
import { TextFieldRHF } from "./form/TextFieldRHF";
import { useContactsForm } from "./form/useContactsForm";
import { useContactsOptions } from "./form/useContactsOptions";

export function ContactsForm({
  clientsId,
  defaultValues,
  onSubmit,
  formId,
  autofocus = true,
  workerLabel,
  leadsSourcesLabel,
  contactTypeLabel,
  clientsLabel,
  hideClientSelector = false,
}: {
  clientsId?: number;
  defaultValues?: Partial<ContactsFormValues>;
  onSubmit: (dto: ContactsUpsertDto) => void;
  formId?: string;
  autofocus?: boolean;
  workerLabel?: string;
  leadsSourcesLabel?: string;
  contactTypeLabel?: string;
  clientsLabel?: string;
  hideClientSelector?: boolean;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState,
    canUseSellerOption,
    currentWorkerId,
  } = useContactsForm({ clientsId, defaultValues });

  const { errors } = formState;

  const {
    clientOptions,
    workerOptions,
    leadsSourcesOptions,
    contactTypeOptions,
    useClientLocal,
    useWorkerLocal,
    useLeadSourcesLocal,
    useContactTypeLocal,
  } = useContactsOptions();

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        const dto: ContactsUpsertDto = {
          contactsCrmId: values.contactsCrmId,
          contactName: values.contactName.trim(),
          jobTitle: values.jobTitle.trim(),
          phone: values.phone ?? "",
          movil: values.movil ?? "",
          email: values.email.trim(),
          workerId: values.workerId!,
          clientsId: hideClientSelector
            ? clientsId ?? defaultValues?.clientsId
            : values.clientsId!,
          leadsSourcesId: values.leadsSourcesId!,
          contactTypeId: values.contactTypeId!,
        };
        onSubmit(dto);
      })}
      className="space-y-5"
      autoComplete="off"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {!hideClientSelector && (
          <div className="col-span-full lg:col-span-12 min-w-0">
            <SearchSelectRHF
              control={control}
              name={"clientsId"}
              label="Cliente"
              options={clientOptions}
              useOptions={useClientLocal}
              placeholder="Buscar cliente..."
              fallbackLabel={clientsLabel}
            />
            {errors.clientsId && (
              <p className="text-xs text-rose-600">
                {errors.clientsId.message}
              </p>
            )}
          </div>
        )}

        <div className="col-span-full lg:col-span-6">
          <TextFieldRHF
            control={control}
            name={"contactName"}
            label="Nombre de Contacto"
            placeholder="EJ: JUAN PEREZ"
            autoFocus={autofocus}
            requiredMark
          />
        </div>

        <div className="col-span-full lg:col-span-6">
          <TextFieldRHF
            control={control}
            name={"jobTitle"}
            label="Cargo"
            placeholder="EJ: GERENTE DE VENTAS"
            requiredMark
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Email <small className="text-xs text-rose-600">*</small>
          </label>
          <input
            id="email"
            type="email"
            placeholder="EJ: contacto@empresa.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoComplete="off"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Teléfono
          </label>
          <input
            id="phone"
            inputMode="tel"
            placeholder="EJ: 01 555 1234"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoComplete="off"
            {...register("phone")}
          />
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Móvil
          </label>
          <input
            id="movil"
            inputMode="tel"
            placeholder="EJ: 987 654 321"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            autoComplete="off"
            {...register("movil")}
          />
        </div>

        {canUseSellerOption ? (
          <div className="col-span-full lg:col-span-6">
            <SearchSelectRHF
              control={control}
              name={"workerId"}
              label="Trabajador (Asignado)"
              options={workerOptions}
              useOptions={useWorkerLocal}
              placeholder="Buscar trabajador..."
              fallbackLabel={workerLabel}
            />
          </div>
        ) : (
          <input
            type="hidden"
            value={currentWorkerId ?? ""}
            {...register("workerId")}
          />
        )}

        <div className="col-span-full lg:col-span-6">
          <SearchSelectRHF
            control={control}
            name={"leadsSourcesId"}
            label="Fuente de Lead"
            options={leadsSourcesOptions}
            useOptions={useLeadSourcesLocal}
            placeholder="Buscar fuente..."
            fallbackLabel={leadsSourcesLabel}
            requiredMark
          />
        </div>

        <div className="col-span-full lg:col-span-6">
          <SearchSelectRHF
            control={control}
            name={"contactTypeId"}
            label="Tipo de Contacto"
            options={contactTypeOptions}
            useOptions={useContactTypeLocal}
            placeholder="Buscar tipo..."
            fallbackLabel={contactTypeLabel}
            requiredMark
          />
        </div>
      </div>
    </form>
  );
}
