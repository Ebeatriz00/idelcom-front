import type { PreSaleProyectsUpsertDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { 
  usePreSaleProyectsById, 
  usePreSaleProyectsMutations 
} from "@/sharedKernel/hooks/presale/usePreSaleProyects";
import { useMemo, useState } from "react";

export function usePreSaleProyectsFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: detail, isFetching } = usePreSaleProyectsById(editingId);
  const { createMut, updateMut } = usePreSaleProyectsMutations();

  const defaultValues = useMemo(() => {

    if (!editingId || !detail) {
      return {
        description: "",
        proyectNum: undefined,
        clientsId: undefined,
        contactsCrmId: undefined,
        opportunityId: undefined,
        statePreSaleId: undefined,
        startDate: undefined,
        endDate: undefined,
        responsibleId: undefined,
        supervisorId: undefined,
        ssomaId: undefined,
        tecLeaderId: undefined,
        quotationNumberId: undefined,
        orderNumberId: undefined,
        orderDate: undefined, 
      };
    }

    return {
      linkToken: detail?.linkToken ?? editingId,
      description: detail?.description ?? "",
      clientsId: detail?.clientsId,
      proyectNum: detail?.proyectNum,
      contactsCrmId: detail?.contactsCrmId,
      responsibleId: detail?.responsibleId ?? undefined,
      supervisorId: detail?.supervisorId ?? undefined,
      ssomaId: detail?.ssomaId ?? undefined,
      tecLeaderId: detail?.tecLeaderId,
      opportunityId: detail?.opportunityId,
      statePreSaleId: detail?.statePreSaleId,
      quotationNumberId: detail?.quotationNumberId ?? undefined,
      orderNumberId: detail?.orderNumberId ?? undefined,
      orderDate: detail?.orderDate ?? undefined,
      startDate: detail?.startDate,
      endDate: detail?.endDate,
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: PreSaleProyectsUpsertDto) { 
    try {
      showLoading("Guardando proyecto..."); 
      if (dto.linkToken == null) { 
        await createMut.mutateAsync(dto);
        showSuccess("Proyecto creado."); 
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Proyecto actualizado."); 
      }
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    isFetching,
    defaultValues,
    detail,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  };
}