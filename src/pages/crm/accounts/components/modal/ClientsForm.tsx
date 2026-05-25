import type { ClientsUpsertDto } from "@/application";
import { FormActions } from "./form/Actions";
import { BasicSection } from "./form/BasicSection";
import { BusinessLeadSection } from "./form/BusinessLeadSection";
import type { ClientsFormValues } from "./form/clients.schema";
import { DocumentAddressSection } from "./form/DocumentSection";
import { SellerSection } from "./form/SellerSection";
import { UbigeoSection } from "./form/UbigeoSection";
import { useClientsForm } from "./form/useClientsForm";

export function ClientsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  documentTypeLabel,
  workerLabel,
  departmentLabel,
  provinceLabel,
  districtLabel,
  processTypeLabel,
  sectorLabel,
  leadSourceLabel,
  leadStatusLabel,
  leadQualificationLabel,
}: {
  defaultValues?: Partial<ClientsUpsertDto>;
  onSubmit: (dto: ClientsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  documentTypeLabel?: string;
  workerLabel?: string;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  processTypeLabel?: string;
  sectorLabel?: string;
  leadSourceLabel?: string;
  leadStatusLabel?: string;
  leadQualificationLabel?: string;
}) {
  const { form, perms, options, useOptionsHooks } = useClientsForm({
    defaultValues,
  });

  const { control, handleSubmit, watch, setValue, formState } = form;
  const { isValid, isSubmitting } = formState;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(
        (values: ClientsFormValues) => {
          if (!perms.canUseSellerOption) {
            const forcedWorkerId =
              perms.currentWorkerId != null
                ? Number(perms.currentWorkerId)
                : undefined;

            if (!forcedWorkerId) {
              console.warn(
                "No se puede guardar: workerId aún no está disponible."
              );
              return;
            }

            onSubmit({
              clientsId: values.clientsId,
              documentTypeId: values.documentTypeId,
              documents: values.documents.trim(),
              clientsName: values.clientsName.trim(),
              clientsCompany: values.clientsCompany,
              clientsAddress: values.clientsAddress.trim(),
              clientsPhone: values.clientsPhone,

              workerId: forcedWorkerId,
              departmentId: values.departmentId ?? undefined,
              provinceId: values.provinceId ?? undefined,
              districtId: values.districtId ?? undefined,

              processTypeId: values.processTypeId ?? undefined,
              sectorId: values.sectorId ?? undefined,

              leadSourceId: values.leadSourceId ?? undefined,
              leadStatusId: values.leadStatusId ?? undefined,
              leadQualificationId: values.leadQualificationId ?? undefined,

              website: values.website ?? "",
            });

            return;
          }
          onSubmit({
            clientsId: values.clientsId,
            documentTypeId: values.documentTypeId,
            documents: values.documents.trim(),
            clientsName: values.clientsName.trim(),
            clientsCompany: values.clientsCompany,
            clientsAddress: values.clientsAddress.trim(),
            clientsPhone: values.clientsPhone,

            workerId: values.workerId ?? undefined,

            departmentId: values.departmentId ?? undefined,
            provinceId: values.provinceId ?? undefined,
            districtId: values.districtId ?? undefined,

            processTypeId: values.processTypeId ?? undefined,
            sectorId: values.sectorId ?? undefined,

            leadSourceId: values.leadSourceId ?? undefined,
            leadStatusId: values.leadStatusId ?? undefined,
            leadQualificationId: values.leadQualificationId ?? undefined,

            website: values.website ?? "",
          });
        },
        (errors) => console.warn("Errores del formulario:", errors)
      )}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <BasicSection control={control} autofocus={autofocus} />

        <DocumentAddressSection
          control={control}
          watch={watch}
          setValue={setValue}
          docTypeOptions={options.docTypeOptions}
          useDocType={useOptionsHooks.useDocType}
          documentTypeLabel={documentTypeLabel}
        />

        <UbigeoSection
          control={control}
          watch={watch}
          setValue={setValue}
          deptItems={options.deptItems}
          provItems={options.provItems}
          distItems={options.distItems}
          useDept={useOptionsHooks.useDept}
          useProv={useOptionsHooks.useProv}
          useDist={useOptionsHooks.useDist}
          departmentLabel={departmentLabel}
          provinceLabel={provinceLabel}
          districtLabel={districtLabel}
        />

        <SellerSection
          control={control}
          watch={watch}
          setValue={setValue}
          canUseSellerOption={perms.canUseSellerOption}
          currentWorkerId={perms.currentWorkerId}
          workerSalesOptions={options.workerSalesOptions}
          useWorkerSales={useOptionsHooks.useWorkerSales}
          workerLabel={workerLabel}
        />

        <BusinessLeadSection
          control={control}
          watch={watch}
          setValue={setValue}
          processTypeOptions={options.processTypeOptions}
          useProcessType={useOptionsHooks.useProcessType}
          processTypeLabel={processTypeLabel}
          sectorOptions={options.sectorOptions}
          useSector={useOptionsHooks.useSector}
          sectorLabel={sectorLabel}
          leadsSourcesOptions={options.leadsSourcesOptions}
          useLeadSources={useOptionsHooks.useLeadSources}
          leadSourceLabel={leadSourceLabel}
          leadsQualificationOptions={options.leadsQualificationOptions}
          useLeadQualification={useOptionsHooks.useLeadQualification}
          leadQualificationLabel={leadQualificationLabel}
          leadsStatusOptions={options.leadsStatusOptions}
          useLeadStatus={useOptionsHooks.useLeadStatus}
          leadStatusLabel={leadStatusLabel}
        />
      </div>

      {showActions && (
        <FormActions
          disabled={!isValid || !!saving || isSubmitting}
          saving={saving}
        />
      )}
    </form>
  );
}
