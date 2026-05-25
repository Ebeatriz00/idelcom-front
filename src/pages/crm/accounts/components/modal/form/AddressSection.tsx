import type { Control } from "react-hook-form";
import { RHFUpperInput } from "./RHFUpperInput";
import type { ClientsFormValues } from "./clients.schema";

export function AddressSection({
  control,
}: {
  control: Control<ClientsFormValues>;
}) {
  return (
    <div className="col-span-full lg:col-span-12">
      <RHFUpperInput
        control={control}
        name="clientsAddress"
        label="Dirección"
        required
        placeholder="Ej: AV. GUARDIA CIVIL 8965"
      />
    </div>
  );
}
