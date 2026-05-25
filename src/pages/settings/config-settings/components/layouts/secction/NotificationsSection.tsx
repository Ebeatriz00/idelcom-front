import { useNotifSettings } from "../../../mutation/useNotifSetting";
import ButtonPrimary from "../../ui/ButtonPrimary";
import Field from "../../ui/Field";
import Toggle from "../../ui/Toggle";

export default function NotificationsSection() {
  const { data, setData, saving, onSaveNotif, query } = useNotifSettings();

  const disabled = saving || query.isLoading;

  return (
    <div className="space-y-3">
      <Field label="Email" index={0}>
        <Toggle
          id="n-email"
          label="Recibir notificaciones por correo"
          checked={!!data.emailNotif}
          onChange={(e) =>
            setData((p) => ({ ...p, emailNotif: e.target.checked }))
          }
          disabled={disabled}
        />
      </Field>

      <Field label="Push" index={1}>
        <Toggle
          id="n-push"
          label="Habilitar notificaciones push"
          checked={!!data.pushNotif}
          onChange={(e) =>
            setData((p) => ({ ...p, pushNotif: e.target.checked }))
          }
          disabled={disabled}
        />
      </Field>

      <ButtonPrimary onClick={onSaveNotif} disabled={disabled}>
        {saving ? "Guardando..." : "Guardar preferencias"}
      </ButtonPrimary>
    </div>
  );
}
