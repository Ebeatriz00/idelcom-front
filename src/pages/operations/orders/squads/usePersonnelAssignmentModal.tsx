import { useState } from "react";
import { useCreateAssignment } from "@/sharedKernel";
import type { OperationsPersonnelAssignmentCreateDto } from "@/application";

export function usePersonnelAssignmentModal(onSuccess?: () => void) {
  const [open, setOpen] = useState(false);
  const [squadId, setSquadId] = useState<number | null>(null);
  const [isAdministrative, setIsAdministrative] = useState(false);

  const { mutateAsync: create, isPending: saving } = useCreateAssignment();

  const openModal = (id: number, isAdm: boolean = false) => {
    setSquadId(id);
    setIsAdministrative(isAdm);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSquadId(null);
    setIsAdministrative(false);
  };

  const submit = async (data: Omit<OperationsPersonnelAssignmentCreateDto, "squadId">) => {
    if (!squadId) return;

    const resp = await create({
      ...data,
      squadId,
      assignmentDate: new Date().toISOString(),
      assignmentStatusId: 1, 
    });

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
    saving,
    squadId,
    isAdministrative,
  };
}
