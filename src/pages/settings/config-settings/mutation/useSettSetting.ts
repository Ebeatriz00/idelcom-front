import type { SettView } from "@/application"; 
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useUsersSett,
  useUsersSettUpdate,
} from "@/sharedKernel";
import { useEffect, useMemo, useState } from "react";

function applyTheme(mode: SettView["theme"]) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.dataset.theme = mode;
}
function applyDensity(d: SettView["density"]) {
  document.documentElement.dataset.density = d;
}

export function useSettSettings() {
  const query = useUsersSett();
  const mutation = useUsersSettUpdate();

  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettView>({
    theme: "system",
    density: "compact",
  });

  useEffect(() => {
    if (query.data) {
      setData(query.data);
      applyTheme(query.data.theme);
      applyDensity(query.data.density);
    }
  }, [query.data]);

  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);
  useEffect(() => {
    applyDensity(data.density);
  }, [data.density]);

  const onSaveSett = async () => {
    try {
      setSaving(true);
      showLoading("Guardando apariencia...");
      const res = await mutation.mutateAsync({ ...data });
      closeAlert();
      if ((res as any)?.status === 1) {
        await showSuccess(
          "Éxito",
          (res as any)?.message ?? "Apariencia actualizada"
        );
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la apariencia"
        );
      }
    } catch (err) {
      closeAlert();
      showApiError(err, "Error al guardar apariencia");
    } finally {
      setSaving(false);
    }
  };

  return useMemo(
    () => ({ data, setData, saving, onSaveSett, query, mutation }),
    [data, saving, query, mutation]
  );
}
