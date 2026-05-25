import type { PeriodsUpsertDto } from "@/application/dtos/accounting/exerper/ExerPer.dto";
import { Button } from "@/layouts/components/ui/button";
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";


function formatToInputDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toISOString().split("T")[0];
  } catch (e) {
    console.error("Fecha inválida:", isoDate);
    return "";
  }
}

export function PeriodsFormModal({
  open,
  onClose,
  onSubmit,
  title,
  defaultValues,
  saving,
  loadingDetail,
  exercisesId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: PeriodsUpsertDto) => Promise<void> | void;
  title: string;
  defaultValues: Partial<PeriodsUpsertDto>;
  saving: boolean;
  loadingDetail: boolean;
  exercisesId: number;
}) {
  const [periodsId, setPeriodsId] = useState<number | undefined>(
    defaultValues?.periodsId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [endDate, setEndDate] = useState(
    formatToInputDate(defaultValues?.endDate)
  );

  useEffect(() => {
    setPeriodsId(defaultValues?.periodsId);
    setDescription(defaultValues?.description ?? "");
    setEndDate(formatToInputDate(defaultValues?.endDate));
  }, [defaultValues]);

  async function handleSubmit() {
    if (!description || !endDate) {
      console.error("Por favor, complete todos los campos.");
      return;
    }

    const dto: PeriodsUpsertDto = {
      periodsId: periodsId,
      description: description,
      endDate: endDate, 
      exercisesId: periodsId ? defaultValues.exercisesId! : exercisesId,
    };

    try {
      await onSubmit(dto);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  }

  if (!open) return null;

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loadingDetail}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Periodo
          </Button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="p-4">Cargando detalle...</div>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">
              Descripción
            </label>
            <input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 h-9 rounded-md border border-gray-200 px-3 text-sm"
              disabled={saving}
              placeholder="Ej: Periodo Enero 2025"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-right">
              Fecha Fin
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3 h-9 rounded-md border border-gray-200 px-3 text-sm"
              disabled={saving}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}