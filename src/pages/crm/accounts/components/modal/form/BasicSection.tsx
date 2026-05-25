import type { Control } from "react-hook-form";
import type { ClientsFormValues } from "./clients.schema";
import { RHFUpperInput } from "./RHFUpperInput";

export function BasicSection({
  control,
  autofocus,
}: {
  control: Control<ClientsFormValues>;
  autofocus?: boolean;
}) {
  return (
    <>
      <div className="col-span-full lg:col-span-6">
        <RHFUpperInput
          control={control}
          name="clientsName"
          label="Cliente"
          required
          placeholder="Ej: PROSEGUR TECNOLOGIA PERU S.A."
          autoFocus={autofocus}
        />
      </div>

      <div className="col-span-full lg:col-span-6">
        <RHFUpperInput
          control={control}
          name="clientsCompany"
          label="Nombre comercial"
          placeholder="Ej: PROSEGUR TECNOLOGIA PERU"
        />
      </div>

      <div className="col-span-full lg:col-span-12">
        <RHFUpperInput
          control={control}
          name="website"
          label="Sitio Web"
          placeholder="Ej: HTTPS://WWW.PROSEGUR.COM.PE/"
        />
      </div>
    </>
  );
}
