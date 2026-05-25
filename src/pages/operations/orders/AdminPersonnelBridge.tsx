import { useEffect } from "react";
import { useSquadList, useCreateAssignment } from "@/sharedKernel";
import { PersonnelAssignmentModal } from "./squads/PersonnelAssignmentModal";
import { useState } from "react";
import type { OperationsPersonnelAssignmentCreateDto } from "@/application";

interface AdminPersonnelBridgeProps {
  workOrderId: number;
  squadName: string;
  onClose: () => void;
}

export function AdminPersonnelBridge({ workOrderId, squadName, onClose }: AdminPersonnelBridgeProps) {
  const [squadId, setSquadId] = useState<number | null>(null);

  // Busca la cuadrilla que pertenece a la OT recién creada
  const { data: squadsData } = useSquadList(0, 10, workOrderId);

  useEffect(() => {
    if (squadsData?.items?.length) {
      setSquadId(squadsData.items[0].squadId);
    }
  }, [squadsData]);

  const { mutateAsync: create, isPending: saving } = useCreateAssignment();

  const handleSubmit = async (data: Omit<OperationsPersonnelAssignmentCreateDto, "squadId">) => {
    if (!squadId) return;

    const resp = await create({
      ...data,
      squadId,
      assignmentDate: new Date().toISOString(),
      assignmentStatusId: 1,
    });

    if (resp.status === 1) {
      onClose();
    }
  };

  // Solo renderiza cuando ya tenemos el squadId
  return (
    <PersonnelAssignmentModal
      open={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      squadName={squadName}
    />
  );
}
