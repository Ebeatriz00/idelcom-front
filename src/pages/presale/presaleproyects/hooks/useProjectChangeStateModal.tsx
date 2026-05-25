import type { ProjectsUpdateStatusDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import { usePreSaleProyectsMutations } from "@/sharedKernel";
import { useState, useMemo } from "react";

export function useProjectChangeStateModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentStateId, setCurrentStateId] = useState<number | undefined>(undefined);
  const [currentBusinessId, setCurrentBusinessId] = useState<number | undefined>(undefined);
  const [currentStateDesc, setCurrentStateDesc] = useState<string | undefined>(undefined);
  
  // 1. Estado para guardar el código de oportunidad (necesario para las carpetas)
  const [currentOpporNumber, setCurrentOpporNumber] = useState<string>(""); 
  
  const [currentPendingCount, setCurrentPendingCount] = useState<number>(0);
  const { updateProjectStateMut } = usePreSaleProyectsMutations();

  const defaultValues = useMemo<Partial<ProjectsUpdateStatusDto>>(() => {
    return {
      linkToken: editingId ?? undefined,
      statePreSaleId: currentStateId,
      businessId: currentBusinessId 
    };
  }, [editingId, currentStateId, currentBusinessId]);

  // 2. Actualizamos la función openEdit para recibir el opporNumber
  function openEdit(
    id: string, 
    stateId?: number, 
    businessId?: number, 
    stateDesc?: string, 
    pendingCount: number = 0,
    opporNumber: string = "" // <-- Nuevo parámetro
  ) {
    setEditingId(id);
    setCurrentStateId(stateId);
    setCurrentBusinessId(businessId);
    setCurrentStateDesc(stateDesc); 
    setCurrentPendingCount(pendingCount);
    setCurrentOpporNumber(opporNumber); // <-- Lo guardamos
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setCurrentStateId(undefined);
    setCurrentBusinessId(undefined);
    setCurrentStateDesc(undefined); 
    setCurrentPendingCount(0);
    setCurrentOpporNumber("");
  }

  async function submit(dto: ProjectsUpdateStatusDto, files?: any[]) {
    try {

      const payload = {
        ...dto,
        preSaleProyectFiles: files || [] 
      };

      await updateProjectStateMut.mutateAsync(payload as any);
      
      close();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }

  return {
    open,
    openEdit,
    close,
    submit,
    defaultValues,
    currentPendingCount,
    currentStateDesc, 
    currentOpporNumber, // <-- Lo exponemos para que el Modal lo pueda leer
    isFetching: false,
    saving: updateProjectStateMut.isPending
  };
}