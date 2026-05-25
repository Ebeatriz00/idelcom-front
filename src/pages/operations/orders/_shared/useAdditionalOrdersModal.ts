import { useState } from "react";

export function useAdditionalOrdersModal() {
  const [open, setOpen] = useState(false);
  const [opporId, setOpporId] = useState<number>(0);

  const openModal = (id: number) => {
    setOpporId(id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOpporId(0);
  };

  return {
    open,
    opporId,
    openModal,
    closeModal,
  };
}
