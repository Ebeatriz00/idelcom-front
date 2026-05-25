import { useEffect, useState } from "react";
import {
  useUsersSetting,
  useUsersSettingUpdate,
} from "@/sharedKernel/hooks/setting/useSetting";
import { closeAlert, showApiError, showLoading, showSuccess } from "@/sharedKernel";
import { mapFormToUpdate, mapViewToForm, type ProfileData } from "@/application";

export function useProfilesSettings() {
  const usersQ = useUsersSetting();
  const updateMut = useUsersSettingUpdate();

  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProfileData>({
    name: "",
    lastName: "",
    email: "",
    documentType: "",
    document: "",
    position: "",
    avatarUrl: "",
  });

  const [usersPhoto, setUsersPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (usersQ.data) {
      setData(mapViewToForm(usersQ.data));
      setUsersPhoto(usersQ.data.usersPhoto ?? undefined);
    }
  }, [usersQ.data]);

  useEffect(() => {
    setData((prev) => ({ ...prev, avatarUrl: usersPhoto ?? "" }));
  }, [usersPhoto]);

  const patchData = (patch: Partial<ProfileData>) =>
    setData((d) => ({ ...d, ...patch }));

  const onSaveProfile = async () => {
    try {
      setSaving(true);
      showLoading("Actualizando perfil...");
      if (!usersQ.data) throw new Error("No hay datos de usuario");

      const dto = mapFormToUpdate(data, usersQ.data);
      dto.usersPhoto = usersPhoto ?? "";

      const res = await updateMut.mutateAsync(dto);
      closeAlert();

      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError({ response: { data: res } }, "No se pudo actualizar el perfil");
      }
    } catch (err) {
      closeAlert();
      showApiError(err, "Error al guardar perfil");
    } finally {
      setSaving(false);
    }
  };

  return {
    // data
    usersQ,
    updateMut,
    saving,
    data,
    usersPhoto,

    // setters
    setUsersPhoto,
    patchData,

    // actions
    onSaveProfile,
  };
}
