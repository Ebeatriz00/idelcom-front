import { useMemo, useState } from "react";

import type { WorkerUpsertDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  useWorkerById,
  useWorkerMutations,
} from "@/sharedKernel";

export function useWorkerFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: detail, isFetching, isSuccess } = useWorkerById(editingId);

  const { createMut, updateMut } = useWorkerMutations();
  const defaultValues = useMemo(() => {
    if (!editingId) {
      const base: Partial<WorkerUpsertDto> = {
        workerName: "",
        workerLastName: "",
        workerDocument: "",

        address: "",
        phone: "",
        email: "",
      };
      return base;
    }

    const d = detail ?? ({} as any);
    return {
      workerId: d.workerId ?? editingId,

      workerName: d.workerName ?? "",
      workerLastName: d.workerLastName ?? "",
      documentTypeId: d.documentTypeId,
      workerDocument: d.workerDocument ?? "",

      areaId: d.areaId,
      jobTitleId: d.jobTitleId,
      prevJob: d.prevJob,

      departmentId: d.departmentId,
      provinceId: d.provinceId,
      districtId: d.districtId,
      address: d.address ?? "",

      phone: d.phone ?? "",
      email: d.email ?? "",

      birthDate: d.birthDate,
      dateEntry: d.dateEntry,
      dateCes: d.dateCes,

      bankId: d.bankId,
      ccBank: d.ccBank,
      cciBank: d.cciBank,

      salary: d.salary,
      numberChildren: d.numberChildren,
      documentTypeLabel: d.documentTypeName,
      jobTitleLabel: d.jobTitleName,
      areaLabel: d.areaName,
      departmentLabel: d.departmentName,
      provinceLabel: d.provinceName,
      districtLabel: d.districtName,
      bankTypeLabel: d.bankName,
    } as Partial<WorkerUpsertDto> & {
      documentTypeLabel?: string;
      jobTitleLabel?: string;
      areaLabel?: string;
      departmentLabel?: string;
      provinceLabel?: string;
      districtLabel?: string;
      bankTypeLabel?: string;
    };
  }, [editingId, detail]);

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function submit(dto: WorkerUpsertDto) {
    try {
      showLoading("Guardando trabajador...");
      if (dto.workerId == null) {
        await createMut.mutateAsync(dto);
        showSuccess("Trabajador creado.");
      } else {
        await updateMut.mutateAsync(dto);
        showSuccess("Trabajador actualizado.");
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
    isSuccess,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
    detail,
  };
}
