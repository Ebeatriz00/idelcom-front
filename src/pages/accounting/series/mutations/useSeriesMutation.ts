import { useState, useMemo } from "react";
import type { SeriesResponseDto, SeriesUpsertDto } from "@/application";
import {
  useSeriesById,
  useSeriesMutations,
} from "@/sharedKernel/hooks/accounting/useSeries";
import {
  showLoading,
  showSuccess,
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

export function useSeriesFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesResponseDto | null>(
    null
  );

  const { data: detail, isFetching } = useSeriesById(editingId);
  const { createMut, updateMut } = useSeriesMutations();

  const defaultValues = useMemo(() => {
    const source = detail || selectedSeries;
    if (editingId != null && source) {
      return {
        seriesId: source.seriesId,
        paymentTypeId: source.paymentTypeId,
        seriesName: source.seriesName ?? "",
        correlative: source.correlative,
      };
    }
    return { seriesName: "", paymentTypeId: undefined, correlative: 1 };
  }, [editingId, detail, selectedSeries]);

  const paymentTypeLabel = useMemo(() => {
    return detail?.paymentTypeDescription ?? selectedSeries?.paymentTypeDescription;
  }, [detail, selectedSeries]);

  function openCreate() {
    setEditingId(null);
    setSelectedSeries(null);
    setOpen(true);
  }

  function openEdit(series: SeriesResponseDto) {
    setEditingId(series.seriesId);
    setSelectedSeries(series);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedSeries(null);
  }

  async function submit(dto: SeriesUpsertDto) {
    try {
      showLoading("Guardando serie...");

      const payload = {
        seriesId: dto.seriesId,
        paymentTypeId: toNumberOrThrow(dto.paymentTypeId, "Tipo de Comprobante"),
        seriesName: dto.seriesName?.trim() ?? "",
        correlative: toNumberOrThrow(dto.correlative, "Correlativo"),
      };

      if (dto.seriesId == null) {
        const { seriesId, ...createPayload } = payload;
        await createMut.mutateAsync(createPayload);
        await showSuccess("Éxito", "Serie creada correctamente.");
      } else {
        await updateMut.mutateAsync(payload);
        await showSuccess("Éxito", "Serie actualizada correctamente.");
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar la serie.");
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
    paymentTypeLabel,
  };
}