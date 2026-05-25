import { useState } from "react";
import { useCreateSquad, useUpdateSquad } from "@/sharedKernel";
import type { OperationsSquadCreateDto, OperationsSquadResponseDto } from "@/application";

export function useSquadModal(onSuccess?: () => void) {
  const [open, setOpen] = useState(false);
  const [workOrderId, setWorkOrderId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<OperationsSquadResponseDto | null>(null);

  const { mutateAsync: create, isPending: creating } = useCreateSquad();
  const { mutateAsync: update, isPending: updating } = useUpdateSquad();

  const openModal = (woId: number, data?: OperationsSquadResponseDto) => {
    setWorkOrderId(woId);
    if (data) {
      setInitialData(data);
    } else {
      setInitialData(null);
    }
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setWorkOrderId(null);
    setInitialData(null);
  };

  const submit = async (formData: any) => {
    if (!workOrderId) return;

    let resp;
    if (initialData?.squadId) {
      resp = await update({
        ...formData,
        squadId: initialData.squadId,
        workOrderId,
      });
    } else {
      resp = await create({
        ...formData,
        workOrderId,
      } as OperationsSquadCreateDto);
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
  };
}
