import { useState } from "react";
import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";

export function useWorkOrderProgressModal() {
  const [open, setOpen] = useState(false);
  const [operationsId, setOperationsId] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [targetQuantity, setTargetQuantity] = useState<number | null>(null);
  const [activityName, setActivityName] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponseDto | null>(null);

  const openModal = (
    opId: number, 
    orderData?: OrdersResponseDto | null,
    actId?: number | null, 
    target?: number | null, 
    actName?: string | null
  ) => {
    setOperationsId(opId);
    setSelectedOrder(orderData || null);
    setActivityId(actId || null);
    setTargetQuantity(target || null);
    setActivityName(actName || null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOperationsId(null);
    setSelectedOrder(null);
    setActivityId(null);
    setTargetQuantity(null);
    setActivityName(null);
  };

  return {
    open,
    operationsId,
    selectedOrder,
    activityId,
    targetQuantity,
    activityName,
    openModal,
    closeModal,
  };
}
