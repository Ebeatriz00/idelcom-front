import type { ClientsUpsertDto } from "@/application";
import { useClientsById, useClientsMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useClientsFormModal( linkContactDialog?: any) {
  const [open, setOpen] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching, isSuccess } = useClientsById(editingId);
  const { createMut, updateMut } = useClientsMutations(linkContactDialog);

  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<ClientsUpsertDto> = {
        clientsName: "",
        documents: "",
        clientsCompany: "",
        clientsAddress: "",
        clientsPhone: "",
        website: "",
      };
      return base;
    }

    const d = detail ?? ({} as any);
    return {
      clientsId: d.clientsId ?? editingId,
      documentTypeId: d.documentTypeId,
      documents: d.documents ?? "",
      clientsName: d.clientsName ?? "",

      clientsCompany: d.clientsCompany ?? "",
      clientsAddress: d.clientsAddress ?? "",
      clientsPhone: d.clientsPhone ?? "",

      workerId: d.workerId,
      workerLabel: d.workerName,

      departmentId: d.departmentId,
      provinceId: d.provinceId,
      districtId: d.districtId,
      departmentLabel: d.departmentName,
      provinceLabel: d.provinceName,
      districtLabel: d.districtName,

      processTypeId: d.processTypeId,
      processTypeLabel: d.processTypeName,

      sectorId: d.sectorId,
      sectorLabel: d.sectorName,

      leadSourceId: d.leadSourceId,
      leadSourceLabel: d.leadSourceName,

      leadStatusId: d.leadStatusId,
      leadStatusLabel: d.leadStatusName,

      leadQualificationId: d.leadQualificationId,
      leadQualificationLabel: d.leadQualificationName,

      website: d.website,
    } as Partial<ClientsUpsertDto> & {
      documentTypeLabel?: string;
      workerLabel?: string;
      departmentLabel?: string;
      provinceLabel?: string;
      districtLabel?: string;
      processTypeLabel?: string;
      sectorLabel?: string;
      leadSourceLabel?: string;
      leadStatusLabel?: string;
      leadQualificationLabel?: string;
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpenHistory(false);
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpenHistory(false);
    setOpen(true);
  }

  function openChangeVendor(id: number) {
    setEditingId(id);
    setOpen(false);
  }

  function openHistoryClienst(id: number) {
    setEditingId(id);
    setOpen(false);
    setOpenHistory(true);
  }

  function close() {
    setOpen(false);
    setOpenHistory(false);
    setEditingId(null);
  }

  async function submit(dto: ClientsUpsertDto) {
    if (dto.clientsId == null) {
      await createMut.mutateAsync(dto as Omit<ClientsUpsertDto, "clientsId">);
    } else {
      await updateMut.mutateAsync(dto);
    }
    close();
  }

  const saving = createMut.isPending || updateMut.isPending;

  return {
    open,
    openHistory,
    isFetching,
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    openChangeVendor,
    openHistoryClienst,
    close,
    submit,
    saving,
    editingId,
  };
}
