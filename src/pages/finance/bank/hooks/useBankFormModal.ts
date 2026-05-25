import { useState, useMemo } from "react";
import type {
  BankResponseDto, 
  BankUpsertDto,   
} from "@/application";
import {
  useBankById,       
  useBankMutations,  
} from "@/sharedKernel/hooks/finance/useBank"; 
import {
  showLoading,
  showApiError,
  closeAlert,
} from "@/sharedKernel";



export function useBankFormModal() { 
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] =
    useState<BankResponseDto | null>(null);

  const { data: detail, isFetching } = useBankById(editingId); 
  const { createMut, updateMut } = useBankMutations(); 

  const defaultValues: Partial<BankUpsertDto> = useMemo(() => { 
    const source = detail || selectedBank;
    if (editingId != null && source) {
      return {
        bankId: source.bankId,            
        abrv: source.abrv ?? "",         
        description: source.description ?? "",
      };
    }
    return { abrv: "", description: "" }; 
  }, [editingId, detail, selectedBank]);



  function openCreate() {
    setEditingId(null);
    setSelectedBank(null); 
    setOpen(true);
  }

  function openEdit(bank: BankResponseDto) { 
    setEditingId(bank.bankId); 
    setSelectedBank(bank);    
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setSelectedBank(null); 
  }

  async function submit(dto: BankUpsertDto) { 
    try {
      showLoading("Guardando banco..."); 

      const payload = {
        bankId: dto.bankId,
        abrv: dto.abrv?.trim() ?? "",
        description: dto.description?.trim() ?? "",
      };

      if (dto.bankId == null) { 
        const { bankId, ...createPayload } = payload; 
        await createMut.mutateAsync(createPayload);
      } else {
        await updateMut.mutateAsync(payload);
      }
      close();
    } catch (err) {
      showApiError(err, "No se pudo guardar el banco.");
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}