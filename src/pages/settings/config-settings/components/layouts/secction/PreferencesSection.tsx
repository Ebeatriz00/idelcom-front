import { usePrefeSettings } from "../../../mutation/usePrefeSetting";
import ButtonPrimary from "../../ui/ButtonPrimary";
import Field from "../../ui/Field";
import SelectInput from "../../ui/SelectInput";
import TextInput from "../../ui/TextInput";
export default function PreferencesSection() {
  const { data, setData, saving, onSavePrefe, query } = usePrefeSettings();
  const disabled = saving || query?.isLoading;

  return (
    <div className="space-y-3">
      <Field label="Idioma" index={0}>
        <SelectInput
          value={data.language}
          onChange={(e) => setData((p) => ({ ...p, language: e.target.value }))}
          disabled={disabled}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </SelectInput>
      </Field>

      <Field label="Zona horaria (IANA)" index={1}>
        <TextInput
          value={data.timezone}
          onChange={(e) => setData((p) => ({ ...p, timezone: e.target.value }))}
          placeholder="America/Lima"
          disabled={disabled}
        />
      </Field>

      <ButtonPrimary onClick={onSavePrefe} disabled={disabled}>
        {saving ? "Aplicando..." : "Aplicar cambios"}
      </ButtonPrimary>
    </div>
  );
}
