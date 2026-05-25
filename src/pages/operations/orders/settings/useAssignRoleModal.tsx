import { useState } from "react";
import Swal from "sweetalert2";
import { closeAlert, showApiError } from "@/sharedKernel";
import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import { useRegisterProjectManager, useRegisterQualitySupervisor } from "@/sharedKernel/hooks/operations/orders/useOrders"; 

export type RoleType = "ProjectManager" | "QualitySupervisor";

export function useAssignRoleModal(
  onSuccessUpdate: (role: RoleType, workerName: string | null) => void
) {
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponseDto | null>(null);
  const [activeRole, setActiveRole] = useState<RoleType | null>(null);

  const { mutateAsync: managerMutate, isPending: managerPending } = useRegisterProjectManager();
  const { mutateAsync: supervisorMutate, isPending: supervisorPending } = useRegisterQualitySupervisor();

  function openModal(order: OrdersResponseDto, role: RoleType) {
    setSelectedOrder(order);
    setActiveRole(role);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelectedOrder(null);
    setActiveRole(null);
  }

  async function submit(data: { workerId?: number | null; workerName?: string | null }) {
    if (!selectedOrder?.operationsId || !activeRole) return;

    try {
      const payload = {
        operationsId: selectedOrder.operationsId,
        workerId: data.workerId ?? undefined,
        usersBy: 1, 
      };

      if (activeRole === "ProjectManager") {
        await managerMutate(payload);
      } else {
        await supervisorMutate(payload);
      }
      
      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "El encargado ha sido asignado correctamente.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });

      onSuccessUpdate(activeRole, data.workerName ?? null);
      
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  return {
    open,
    close,
    openModal,
    submit,
    saving: managerPending || supervisorPending,
    selectedOrder,
    activeRole,
  };
}