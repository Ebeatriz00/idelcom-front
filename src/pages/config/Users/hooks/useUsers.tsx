import type { UsersPasswordChangeDto, UsersUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useUsersById,
  useUsersMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useUsersFormModal() {
  const [open, setOpen] = useState(false); // modal de crear/editar
  const [openPwd, setOpenPwd] = useState(false); // modal de cambiar pass
  const [editingId, setEditingId] = useState<number | null>(null);

  // evita pasar null/undefined si tu hook no lo admite:
  const { data: detail, isFetching } = useUsersById(editingId ?? undefined);

  // OJO: corregimos el nombre a paswwordChangeMut
  const { createMut, updateMut, paswwordChangeMut } = useUsersMutations();

  const defaultValues: UsersUpsertDto = useMemo(() => {
    if (!editingId) {
      return {
        usersName: "",
        workerId: 0,
        usersLastName: "",
        usersCode: "",
        usersEmail: "",
        documentTypeId: 0,
        profilesId: 0,
        usersDocument: "",
        usersPhoto: "",
        usersPassword: "",
      };
    }
    return {
      usersId: detail?.usersId ?? editingId,
      workerId: detail?.workerId ?? 0,
      usersName: detail?.usersName ?? "",
      usersLastName: detail?.usersLastName ?? "",
      usersCode: detail?.usersCode ?? "",
      usersEmail: detail?.usersEmail ?? "",
      documentTypeId: detail?.documentTypeId ?? 0,
      profilesId: detail?.profilesId ?? 0,
      usersDocument: detail?.usersDocument ?? "",
      usersPhoto: detail?.usersPhoto ?? "",
      usersPassword: "",
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }
  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }
  function openChangePassword(id: number) {
    setEditingId(id);
    setOpenPwd(true);
  }
  function close() {
    setOpen(false);
    setEditingId(null);
  }
  function closeChange() {
    setOpenPwd(false);
    setEditingId(null);
  }

  async function submit(dto: UsersUpsertDto) {
    try {
      showLoading("Guardando usuario...");
      if (dto.usersId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Usuario creado.");
      } else {
        const { usersPassword: _ignore, ...rest } = dto as any;
        await updateMut.mutateAsync(rest);
        showSuccess("Usuario actualizado.");
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }
  async function submitPasswordChange(input: UsersPasswordChangeDto) {
    try {
      const userId = input.usersId ?? editingId!;
      if (!userId) throw new Error("Falta usersId para cambio de contraseña.");

      showLoading("Actualizando contraseña...");
      await paswwordChangeMut.mutateAsync({
        usersId: userId,
        usersPassword: input.usersPassword,
      });
      showSuccess("Contraseña actualizada.");
      closeChange();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;
  const changing = paswwordChangeMut.isPending;

  return {
    // modal crear/editar
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,

    openPwd,
    openChangePassword,
    closeChange,
    submitPasswordChange,
    changing,
  };
}
