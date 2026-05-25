// hooks/useModulesPermissionsFormModal.ts
import { useMemo, useState } from "react";
import {
  useModulesPermissionsById,
  useModulesPermissionsMutations,
} from "@/sharedKernel/hooks/modulesPermissions/useModulesPermissions";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";

export type ModulesPermissionsFormValues = {
  modulesPermissionsId?: number;
  modulesId?: number;
  permissionsId?: number;
};

function toNumberOrThrow(v: number | string | undefined, field: string): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n as number)) {
    throw new Error(`El campo ${field} es obligatorio.`);
  }
  return n as number;
}

/** 
 * Soporta:
 * - openEdit(id): trae detalle por id y abre para editar
 * - openCreate(): abre vacío
 * - openEditSeeded(seed): abre con módulo bloqueado y labels (útil desde mini-lista)
 */
export function useModulesPermissionsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // "Seed" cuando vienes desde mini-lista: módulo bloqueado + labels reales
  const [seed, setSeed] = useState<{
    modulesId?: number;
    permissionsId?: number;
    moduleLabel?: string;
    permissionLabel?: string;
    lockModule?: boolean;
  } | null>(null);

  const { data: detail, isFetching } = useModulesPermissionsById(editingId);
  const { createMut, updateMut } = useModulesPermissionsMutations();

  const defaultValues: ModulesPermissionsFormValues = useMemo(() => {
    if (editingId != null) {
      return {
        modulesPermissionsId: detail?.modulesPermissionsId ?? editingId,
        modulesId: detail?.modulesId ?? undefined,
        permissionsId: detail?.permissionsId ?? undefined,
      };
    }
    if (seed) {
      return {
        modulesId: seed.modulesId,
        permissionsId: seed.permissionsId,
      };
    }
    return { modulesId: undefined, permissionsId: undefined };
  }, [editingId, detail, seed]);

  function openCreate() {
    setEditingId(null);
    setSeed(null);
    setOpen(true);
  }

  function openEditSeeded(opts: {
    modulesPermissionsId?: number;
    modulesId: number;
    permissionsId?: number;
    moduleLabel?: string;
    permissionLabel?: string;
    lockModule?: boolean;
  }) {
    const { modulesPermissionsId, modulesId, permissionsId, moduleLabel, permissionLabel, lockModule = true } = opts;

    setSeed({ modulesId, permissionsId, moduleLabel, permissionLabel, lockModule });

    if (modulesPermissionsId != null && modulesPermissionsId > 0) {
      setEditingId(modulesPermissionsId);
    } else {
      setEditingId(null);
    }
    setOpen(true);
  }

  function openEdit(id: number) {
    setSeed(null);
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSeed(null);
  }

  async function submit(dto: ModulesPermissionsFormValues) {
    try {
      showLoading("Guardando vínculo módulo-permiso...");

      const payload = {
        modulesId: toNumberOrThrow(dto.modulesId, "modulesId"),
        permissionsId: toNumberOrThrow(dto.permissionsId, "permissionsId"),
      };

      if (dto.modulesPermissionsId == null) {
        await createMut.mutateAsync(payload as any);
        await showSuccess("Éxito", "Vínculo creado.");
      } else {
        await updateMut.mutateAsync({ modulesPermissionsId: dto.modulesPermissionsId, ...payload } as any);
        await showSuccess("Éxito", "Vínculo actualizado.");
      }

      close();
    } catch (err) {
      await showApiError(err, "No se pudo guardar.");
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  // Exponemos además los labels y el lock para que el Modal/Form los usen
  const uiLocks = {
    lockModule: !!seed?.lockModule,
    moduleLabel: seed?.moduleLabel,
    permissionLabel: seed?.permissionLabel,
  };

  return {
    // estado
    open,
    isFetching,
    defaultValues,
    saving,
    editingId,
    uiLocks,

    // acciones
    openCreate,
    openEdit,
    openEditSeeded,
    close,
    submit,
  };
}
