import { useState, useMemo } from "react";
import { useHiringMutations } from "@/sharedKernel"; 

export function useHiringChangeStateModal() {
  const [open, setOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentStateId, setCurrentStateId] = useState<number | null>(null);
  const [currentStateDesc, setCurrentStateDesc] = useState<string | undefined>(undefined);
  
  const [currentOpporNum, setCurrentOpporNum] = useState<string>("");

  const [currentPreSalesId, setCurrentPreSalesId] = useState<number | null>(null);
  const [currentTypeObs, setCurrentTypeObs] = useState<number | null>(null);
  const [currentAffects, setCurrentAffects] = useState<number | null>(null);
  const [currentOpporStateId, setCurrentOpporStateId] = useState<number | null>(null);

  const { statusMut } = useHiringMutations();

  const defaultValues = useMemo(() => ({
    hiringId: editingId ?? 0,
    licStatusId: currentStateId ?? 0,
  }), [editingId, currentStateId]);

  function openEdit(
    hiringId: number, 
    stateId?: number, 
    stateDesc?: string, 
    opporNum?: string,
    preSalesId?: number,
    typeObs?: number,
    affects?: number,
    opporStateId?: number
  ) {
    setEditingId(hiringId);
    setCurrentStateId(stateId ?? null);
    setCurrentStateDesc(stateDesc);
    setCurrentOpporNum(opporNum ?? ""); 
    
    setCurrentPreSalesId(preSalesId ?? null);
    setCurrentTypeObs(typeObs ?? null);
    setCurrentAffects(affects ?? null);
    setCurrentOpporStateId(opporStateId ?? null);

    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setCurrentStateId(null);
    setCurrentStateDesc(undefined);
    setCurrentOpporNum(""); 
    
    setCurrentPreSalesId(null);
    setCurrentTypeObs(null);
    setCurrentAffects(null);
    setCurrentOpporStateId(null);
  }

  async function submit(data: { licStatusId: number }, files?: any[]) {
    if (!editingId) return;
    
    try {
      await statusMut.mutateAsync({
        hiringId: editingId,
        licStatusId: data.licStatusId,
        hiringFiles: files
      });
      close();
    } catch (error) {
      console.error(error);
    }
  }

  return {
    open,
    openEdit,
    close,
    submit,
    defaultValues,
    currentStateDesc,
    currentOpporNum,
    currentPreSalesId,
    currentTypeObs,
    currentAffects,
    currentOpporStateId,
    saving: statusMut.isPending
  };
}