import { useEffect, useMemo, useState } from "react";
import type { NotifView } from "@/application";
import {
  useUsersNotif,
  useUsersNotifUpdate,
  showLoading,
  closeAlert,
  showSuccess,
  showApiError,
} from "@/sharedKernel";

export function useNotifSettings() {
  const usersNotif = useUsersNotif();
  const updateNotifMut = useUsersNotifUpdate();

  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<NotifView>({ emailNotif: true, pushNotif: false });

  useEffect(() => {
    if (usersNotif.data) setData(usersNotif.data);
  }, [usersNotif.data]);

  const onSaveNotif = async () => {
    try {
      setSaving(true);
      showLoading("Actualizando preferencias de notificaciones...");
      const dto: NotifView = { ...data };
      const res = await updateNotifMut.mutateAsync(dto);

      closeAlert();
      if ((res as any)?.status === 1) {
        await showSuccess("Éxito", (res as any)?.message ?? "Preferencias actualizadas");
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar las notificaciones");
      }
    } catch (err) {
      closeAlert();
      showApiError(err, "Error al guardar notificaciones");
    } finally {
      setSaving(false);
    }
  };

  return useMemo(
    () => ({
      data,
      setData,
      saving,
      onSaveNotif,
      query: usersNotif,
      mutation: updateNotifMut,
    }),
    [data, saving, usersNotif, updateNotifMut]
  );
}
