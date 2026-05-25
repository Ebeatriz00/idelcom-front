import { useState } from "react";
import Swal from "sweetalert2";
import { showApiError } from "@/sharedKernel"; 
import type { OrdersResponseDto, RegisterSsoma } from "@/application/dtos/operations/orders/orders.dto";
import { useRegisterOrderSsoma } from "@/sharedKernel/hooks/operations/orders/useOrders";

export function useSsomaModal() {
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponseDto | null>(null);

  const { mutateAsync: registerSsoma, isPending } = useRegisterOrderSsoma();

  function openModal(order: OrdersResponseDto) {
    setSelectedOrder(order);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelectedOrder(null);
  }

  async function submit(data: { requeredSsoma: boolean; workerId: number[] }) {
    if (!selectedOrder?.operationsId) return;

    try {
      const payload: Omit<RegisterSsoma, "businessId"> = {
        operationsId: selectedOrder.operationsId,
        requeredSsoma: data.requeredSsoma, 
        workerId: data.workerId,        
        usersBy: 1, 
      };

      await registerSsoma(payload);

      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "El equipo SSOMA ha sido actualizado correctamente.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb", 
      });

      close();
      
    } catch (err) {
      showApiError(err);
    }
  }

  return {
    open,
    close,
    openModal,
    submit,
    saving: isPending,
    selectedOrder,
  };
}