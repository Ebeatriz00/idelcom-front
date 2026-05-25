import type { RequirementUpsertDto } from "@/application/dtos/operations/requirement/requeriment.dto";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useRequirementById,
  useRequirementMutations,
} from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";
import { useMemo, useState } from "react";

export function useRequirementFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching } = useRequirementById(
    editingId ?? undefined,
  );
  const { createMut, updateMut, deleteMut } = useRequirementMutations();

  const defaultValues = useMemo<RequirementUpsertDto>(() => {
    if (!editingId || !detail) {
      return {
        name: "",
        description: "",
        duration: 0,
        scopeId: 0,
        hasExpiration: false,
        requiresFile: false,
        requiresExpiration: false,
        maxFileSize: 0,
        allowedExtensions: "",
        allowInternalReuse: false,
      };
    }
    return {
      requirementId: detail?.requirementId ?? editingId,
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      duration: detail?.duration ?? 0,
      scopeId: detail?.scopeId ?? 0,
      hasExpiration: detail?.hasExpiration ?? false,
      requiresFile: detail?.requiresFile ?? false,
      requiresExpiration: detail?.requiresExpiration ?? false,
      maxFileSize: detail?.maxFileSize ?? 0,
      allowedExtensions: detail?.allowedExtensions ?? "",
      allowInternalReuse: detail?.allowInternalReuse ?? false,
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

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: RequirementUpsertDto) {
    try {
      if (dto.requirementId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  async function remove(id: number) {
    try {
      await deleteMut.mutateAsync(id);
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    remove,
    saving,
    editingId,
  };
}
