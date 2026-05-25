import type { OptionItem } from "@/application";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { idToOption, type ClientsFormValues } from "./clients.schema";
import { RHFSearchSelect } from "./RHFSearchSelect";

export function BusinessLeadSection({
  control,
  watch,
  setValue,

  processTypeOptions,
  useProcessType,
  processTypeLabel,

  sectorOptions,
  useSector,
  sectorLabel,

  leadsSourcesOptions,
  useLeadSources,
  leadSourceLabel,

  leadsQualificationOptions,
  useLeadQualification,
  leadQualificationLabel,

  leadsStatusOptions,
  useLeadStatus,
  leadStatusLabel,
}: {
  control: Control<ClientsFormValues>;
  watch: UseFormWatch<ClientsFormValues>;
  setValue: UseFormSetValue<ClientsFormValues>;

  processTypeOptions: OptionItem[];
  useProcessType: any;
  processTypeLabel?: string;

  sectorOptions: OptionItem[];
  useSector: any;
  sectorLabel?: string;

  leadsSourcesOptions: OptionItem[];
  useLeadSources: any;
  leadSourceLabel?: string;

  leadsQualificationOptions: OptionItem[];
  useLeadQualification: any;
  leadQualificationLabel?: string;

  leadsStatusOptions: OptionItem[];
  useLeadStatus: any;
  leadStatusLabel?: string;
}) {
  const processTypeId = watch("processTypeId");
  const sectorId = watch("sectorId");
  const leadSourceId = watch("leadSourceId");
  const leadQualificationId = watch("leadQualificationId");
  const leadStatusId = watch("leadStatusId");

  return (
    <>
      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="processTypeId"
          label="Sector"
          useOptions={useProcessType}
          value={
            processTypeOptions.find((o) => Number(o.value) === processTypeId) ??
            idToOption(processTypeId, processTypeLabel)
          }
          onChangeValue={(opt) =>
            setValue("processTypeId", opt ? Number(opt.value) : null)
          }
          placeholder="Buscar tipo..."
          pageSize={100}
          minSearchChars={1}
        />
      </div>

      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="sectorId"
          label="Negocio"
          useOptions={useSector}
          value={
            sectorOptions.find((o) => Number(o.value) === sectorId) ??
            idToOption(sectorId, sectorLabel)
          }
          onChangeValue={(opt) =>
            setValue("sectorId", opt ? Number(opt.value) : null)
          }
          placeholder="Buscar sector…"
          pageSize={100}
          minSearchChars={1}
        />
      </div>

      <div className="col-span-full lg:col-span-4">
        <RHFSearchSelect
          control={control}
          name="leadSourceId"
          label="Fuente"
          useOptions={useLeadSources}
          value={
            leadsSourcesOptions.find((o) => Number(o.value) === leadSourceId) ??
            idToOption(leadSourceId, leadSourceLabel)
          }
          onChangeValue={(opt) =>
            setValue("leadSourceId", opt ? Number(opt.value) : null)
          }
          placeholder="Buscar fuente…"
          pageSize={100}
          minSearchChars={1}
        />
      </div>

      <div className="col-span-full lg:col-span-6">
        <RHFSearchSelect
          control={control}
          name="leadQualificationId"
          label="Calificación"
          useOptions={useLeadQualification}
          value={
            leadsQualificationOptions.find(
              (o) => Number(o.value) === leadQualificationId
            ) ?? idToOption(leadQualificationId, leadQualificationLabel)
          }
          onChangeValue={(opt) =>
            setValue("leadQualificationId", opt ? Number(opt.value) : null)
          }
          placeholder="Buscar calificación…"
          pageSize={100}
          minSearchChars={1}
        />
      </div>

      <div className="col-span-full lg:col-span-6">
        <RHFSearchSelect
          control={control}
          name="leadStatusId"
          label="Estado"
          useOptions={useLeadStatus}
          value={
            leadsStatusOptions.find((o) => Number(o.value) === leadStatusId) ??
            idToOption(leadStatusId, leadStatusLabel)
          }
          onChangeValue={(opt) =>
            setValue("leadStatusId", opt ? Number(opt.value) : null)
          }
          placeholder="Buscar estado…"
          pageSize={100}
          minSearchChars={1}
        />
      </div>
    </>
  );
}
