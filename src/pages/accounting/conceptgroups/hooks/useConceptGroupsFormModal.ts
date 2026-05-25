import { useState, useMemo } from "react";
import type {
  ConceptGroupsResponseDto,
  ConceptGroupsUpsertDto,
} from "@/application";
import {
  useConceptGroupsById,
  useConceptGroupsMutations,
} from "@/sharedKernel/hooks/accounting/useConceptGroups";
import {
  showLoading,
  showApiError,
  closeAlert,
} from "@/sharedKernel";

function toNumberOrThrow(v: number | string | undefined, field: string): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n as number)) {
    throw new Error(`El campo '${field}' es obligatorio.`);
  }
  return n as number;
}

export function useConceptGroupsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedConceptGroup, setSelectedConceptGroup] =
    useState<ConceptGroupsResponseDto | null>(null);

  const { data: detail, isFetching } = useConceptGroupsById(editingId);
  const { createMut, updateMut } = useConceptGroupsMutations();

  const defaultValues: Partial<ConceptGroupsUpsertDto> = useMemo(() => {
    const source = detail || selectedConceptGroup;
    if (editingId != null && source) {
      return {
        conceptGroupsId: source.conceptGroupsId,
        conceptTypeId: source.conceptTypeId,
        code: source.code ?? "",
        description: source.description ?? "",
      };
    }
    return { code: "", description: "", conceptTypeId: undefined };
  }, [editingId, detail, selectedConceptGroup]);

  const conceptTypeLabel = useMemo(() => {
    return (
      detail?.conceptTypeDescription ?? selectedConceptGroup?.conceptTypeDescription
    );
  }, [detail, selectedConceptGroup]);

  function openCreate() {
    setEditingId(null);
    setSelectedConceptGroup(null);
    setOpen(true);
  }

  function openEdit(conceptGroup: ConceptGroupsResponseDto) {
    setEditingId(conceptGroup.conceptGroupsId);
    setSelectedConceptGroup(conceptGroup);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedConceptGroup(null);
  }

  async function submit(dto: ConceptGroupsUpsertDto) {
    try {
      showLoading("Guardando grupo de conceptos...");

      const payload = {
        conceptGroupsId: dto.conceptGroupsId,
        conceptTypeId: toNumberOrThrow(dto.conceptTypeId, "Tipo de Concepto"),
        code: dto.code?.trim() ?? "",
        description: dto.description?.trim() ?? "",
      };

      if (dto.conceptGroupsId == null) {
        const { conceptGroupsId, ...createPayload } = payload;
        await createMut.mutateAsync(createPayload);
      } else {
        await updateMut.mutateAsync(payload);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar el grupo de conceptos.");
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
    saving,
    editingId,
    conceptTypeLabel,
  };
}