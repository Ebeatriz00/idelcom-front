import type { JobTitleResponseDto, JobTitleUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  useJobTitleById,
  useJobTitleMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";
function toNumberOrThrow(
  v: number | string | undefined,
  field: string
): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n as number)) {
    throw new Error(`El campo '${field}' es obligatorio.`);
  }
  return n as number;
}

export function useJobTitleFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] =
    useState<JobTitleResponseDto | null>(null);

  const { data: detail, isFetching } = useJobTitleById(editingId);
  const { createMut, updateMut } = useJobTitleMutations();

  const defaultValues: Partial<JobTitleUpsertDto> = useMemo(() => {
    const source = detail || selectedJobTitle;
    if (editingId != null && source) {
      return {
        jobTitleId: source.jobTitleId,
        areaId: source.areaId,
        description: source.description ?? "",
      };
    }
    return { description: "", areaId: undefined };
  }, [editingId, detail, selectedJobTitle]);

  const areaLabel = useMemo(() => {
    return detail?.areaDescription ?? selectedJobTitle?.areaDescription;
  }, [detail, selectedJobTitle]);

  function openCreate() {
    setEditingId(null);
    setSelectedJobTitle(null);
    setOpen(true);
  }

  function openEdit(jobTitle: JobTitleResponseDto) {
    setEditingId(jobTitle.jobTitleId);
    setSelectedJobTitle(jobTitle);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedJobTitle(null);
  }

  async function submit(dto: JobTitleUpsertDto) {
    try {
      showLoading("Guardando cargo...");

      const payload = {
        jobTitleId: dto.jobTitleId,
        areaId: toNumberOrThrow(dto.areaId, "Área"),
        description: dto.description?.trim() ?? "",
      };

      if (dto.jobTitleId == null) {
        const { jobTitleId, ...createPayload } = payload;
        await createMut.mutateAsync(createPayload);
      } else {
        await updateMut.mutateAsync(payload);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar el cargo.");
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
    areaLabel,
  };
}
