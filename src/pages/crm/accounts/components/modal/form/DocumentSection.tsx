import type { OptionItem } from "@/application";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { idToOption, type ClientsFormValues } from "./clients.schema";
import { RHFSearchSelect } from "./RHFSearchSelect";
import { RHFUpperInput } from "./RHFUpperInput";

export function DocumentAddressSection({
  control,
  watch,
  setValue,
  docTypeOptions,
  useDocType,
  documentTypeLabel,
}: {
  control: Control<ClientsFormValues>;
  watch: UseFormWatch<ClientsFormValues>;
  setValue: UseFormSetValue<ClientsFormValues>;
  docTypeOptions: OptionItem[];
  useDocType: any;
  documentTypeLabel?: string;
}) {
  const documentTypeId = watch("documentTypeId");

  return (
    <>
      <div className="col-span-full lg:col-span-7">
        <RHFSearchSelect
          control={control}
          name="documentTypeId"
          label="Tipo de documento"
          required
          useOptions={useDocType}
          value={
            docTypeOptions.find((o) => Number(o.value) === documentTypeId) ??
            idToOption(documentTypeId, documentTypeLabel)
          }
          onChangeValue={(opt) =>
            setValue(
              "documentTypeId",
              opt ? Number(opt.value) : (undefined as any)
            )
          }
          placeholder="Buscar tipo de documento…"
          pageSize={100}
          minSearchChars={1}
        />
      </div>

      <div className="col-span-full lg:col-span-5">
        <RHFUpperInput
          control={control}
          name="documents"
          label="Documento"
          required
          placeholder="Ej: 20369754869"
          inputMode="numeric"
          transform={(v) => v.replace(/\D/g, "").slice(0, 11)}
        />
      </div>

      <div className="col-span-full lg:col-span-12">
        <RHFUpperInput
          control={control}
          name="clientsAddress"
          label="Dirección"
          required
          placeholder="Ej: AV. GUARDIA CIVIL 8965"
        />
      </div>
    </>
  );
}
