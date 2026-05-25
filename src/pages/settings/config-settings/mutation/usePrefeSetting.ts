import type { PrefeView } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useUsersPrefe,
  useUsersPrefeUpdate,
} from "@/sharedKernel";
import { useEffect, useMemo, useState } from "react";

export function usePrefeSettings() {
  const usersPrefe = useUsersPrefe();

  const updatePrefeMut = useUsersPrefeUpdate();

  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<PrefeView>({
    language: "",
    timezone: "",
  });

  useEffect(() => {
    if (usersPrefe.data) {
      setData(usersPrefe.data);
    }
  }, [usersPrefe.data]);

  const onSavePrefe = async () => {
    try {
      setSaving(true);
      showLoading("Actualizando preferencias...");
      const dto: PrefeView = { ...data };
      const res = await updatePrefeMut.mutateAsync(dto);

      closeAlert();
      if ((res as any)?.status === 1) {
        await showSuccess(
          "Éxito",
          (res as any)?.message ?? "Preferencias actualizadas"
        );
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar las preferencias"
        );
      }
    } catch (err) {
      closeAlert();
      showApiError(err, "Error al guardar las preferencias");
    } finally {
      setSaving(false);
    }
  };

  return useMemo(
    () => ({
      data,
      setData,
      saving,
      onSavePrefe,
      query: usersPrefe,
      mutation: updatePrefeMut,
    }),
    [data, saving, usersPrefe, updatePrefeMut]
  );
}
