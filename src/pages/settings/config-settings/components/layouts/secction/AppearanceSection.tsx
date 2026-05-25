import { useThemeRuntime } from "@/sharedKernel";
import { useSettSettings } from "../../../mutation/useSettSetting";
import ButtonPrimary from "../../ui/ButtonPrimary";
import Field from "../../ui/Field";
import RadioGroup from "../../ui/RadioGroup";
import SelectInput from "../../ui/SelectInput";

export default function AppearanceSection() {
  const { data, setData, saving, onSaveSett, query } = useSettSettings();
  const disabled = saving || query?.isLoading;

  useThemeRuntime(data.theme);

  return (
    <div className="space-y-3">
      <Field label="Tema" index={0}>
        <RadioGroup
          name="theme"
          value={data.theme}
          onChange={(v) =>
            setData((p) => ({ ...p, theme: v as typeof p.theme }))
          }
          options={[
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
            { value: "system", label: "Sistema" },
          ]}
          disabled={disabled}
        />
      </Field>

      <Field label="Densidad" index={1}>
        <SelectInput
          value={data.density}
          onChange={(e) =>
            setData((p) => ({
              ...p,
              density: e.target.value as typeof p.density,
            }))
          }
          disabled={disabled}
        >
          <option value="compact">Compacta</option>
          <option value="comfort">Confort</option>
        </SelectInput>
      </Field>

      <ButtonPrimary onClick={onSaveSett} disabled={disabled}>
        {saving ? "Guardando..." : "Guardar"}
      </ButtonPrimary>
    </div>
  );
}
