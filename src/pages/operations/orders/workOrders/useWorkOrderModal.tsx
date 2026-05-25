import { useState } from "react";
import { useCreateWorkOrder, useUpdateWorkOrder } from "@/sharedKernel";
import type { OperationsWorkOrderCreateDto, OperationsWorkOrderResponseDto, OperationsWorkOrderUpdateDto } from "@/application";

export function useWorkOrderModal(onSuccess?: () => void) {
  const [open, setOpen] = useState(false);
  const [operationsId, setOperationsId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<OperationsWorkOrderResponseDto | null>(null);

  const { mutateAsync: create, isPending: creating } = useCreateWorkOrder();
  const { mutateAsync: update, isPending: updating } = useUpdateWorkOrder();

  const openModal = (opsId: number, data?: OperationsWorkOrderResponseDto) => {
    setOperationsId(opsId);
    if (data) {
      setInitialData(data);
    } else {
      setInitialData(null);
    }
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOperationsId(null);
    setInitialData(null);
  };

  const submit = async (formData: any) => {
    if (!operationsId) return;

    let resp;
    if (initialData?.workOrderId) {
      // Editar
      resp = await update({
        ...formData,
        workOrderId: initialData.workOrderId,
        operationsId,
      } as OperationsWorkOrderUpdateDto);
    } else {
      // Crear
      resp = await create({
        ...formData,
        operationsId,
      } as OperationsWorkOrderCreateDto);
    }

    if (resp.status === 1) {
      closeModal();
      if (onSuccess) onSuccess();
    }
  };

  return {
    open,
    openModal,
    closeModal,
    submit,
    saving: creating || updating,
    initialData,
    operationsId,
  };
}
