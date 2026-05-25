import { useState } from "react";

export function useWorkOrderProgressModal() {
  const [open, setOpen] = useState(false);
  const [operationsId, setOperationsId] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [targetQuantity, setTargetQuantity] = useState<number | null>(null);
  const [activityName, setActivityName] = useState<string | null>(null);

  const openModal = (
    opId: number, 
    actId?: number | null, 
    target?: number | null, 
    actName?: string | null
  ) => {
    setOperationsId(opId);
    setActivityId(actId || null);
    setTargetQuantity(target || null);
    setActivityName(actName || null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOperationsId(null);
    setActivityId(null);
    setTargetQuantity(null);
    setActivityName(null);
  };

  return {
    open,
    operationsId,
    activityId,
    targetQuantity,
    activityName,
    openModal,
    closeModal,
  };
}
