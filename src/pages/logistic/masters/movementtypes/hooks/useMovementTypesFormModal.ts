import type {
  MovementTypesResponseDto,
  MovementTypesUpsertDto,
} from "@/application";
import { closeAlert, showApiError } from "@/sharedKernel";
import {
  useMovementTypesById,
  useMovementTypesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useMovementTypes";
import { useMemo, useState } from "react";

export function useMovementTypesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMovementType, setSelectedMovementType] =
    useState<MovementTypesResponseDto | null>(null);

  const {
    data: detail,
    isFetching,
    isSuccess,
  } = useMovementTypesById(editingId);
  const { createMut, updateMut } = useMovementTypesMutations();

  const defaultValues: Partial<MovementTypesUpsertDto> = useMemo(() => {
    const source = detail || selectedMovementType;
    if (editingId != null && source) {
      return {
        movementTypesId: source.movementTypesId,
        description: source.description ?? "",
        code: source.code ?? "",
        movClasId: source.movClasId,
        movOperId: source.movOperId,
        movSunatId: source.movSunatId,
        movPerId: source.movPerId,
        affectsStock: source.affectsStock,
        requiresDestWare: source.requiresDestWare,
        generatesAccounting: source.generatesAccounting,
        IsAdjustment: source.IsAdjustment,
        allowNegative: source.allowNegative,
      };
    }
    return {
      description: "",
      code: "",
      movClasId: undefined,
      movOperId: undefined,
      movPerId: undefined,
      movSunatId: undefined,
      movVisId: undefined,
    };
  }, [editingId, detail, selectedMovementType]);

  const movClasLabel = useMemo(() => {
    return (
      detail?.movClasDescription ?? selectedMovementType?.movClasDescription
    );
  }, [detail, selectedMovementType]);

  const movOperLabel = useMemo(() => {
    return (
      detail?.movOperDescription ?? selectedMovementType?.movOperDescription
    );
  }, [detail, selectedMovementType]);

  const movPerLabel = useMemo(
    () => detail?.movPerDescription ?? selectedMovementType?.movPerDescription,
    [detail, selectedMovementType],
  );

  const movSunatLabel = useMemo(() => {
    return (
      detail?.movSunatDescription ?? selectedMovementType?.movSunatDescription
    );
  }, [detail, selectedMovementType]);

  const movVisLabel = useMemo(
    () => detail?.movVisDescription ?? selectedMovementType?.movVisDescription,
    [detail, selectedMovementType],
  );

  function openCreate() {
    setEditingId(null);
    setSelectedMovementType(null);
    setOpen(true);
  }

  function openEdit(movementType: MovementTypesResponseDto) {
    setEditingId(movementType.movementTypesId ?? null);
    setSelectedMovementType(movementType);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedMovementType(null);
  }

  async function submit(dto: MovementTypesUpsertDto) {
    try {
      if (dto.movementTypesId == null) {
        await createMut.mutateAsync(dto);
      } else {
        await updateMut.mutateAsync(dto);
      }

      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar el tipo de movimiento.");
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
    movClasLabel,
    movOperLabel,
    movPerLabel,
    movSunatLabel,
    movVisLabel,
  };
}
