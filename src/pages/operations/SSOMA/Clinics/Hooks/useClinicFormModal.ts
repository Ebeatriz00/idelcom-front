import { useState } from "react";
import type { ClinicFormValues } from "../utils/clinic.schema";
import { useUpdateClinic, useCreateClinic } from "@/sharedKernel/hooks/operations/SSOMA/clinics/useClinic";
import type { ClinicResponseDto } from "@/application/dtos/operations/clinics/clinic.dto";

export function useClinicFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();

  const { mutateAsync: update, isPending: isUpdating } = useUpdateClinic();
  const { mutateAsync: create, isPending: isCreating } = useCreateClinic();

  const [defaultValues, setDefaultValues] = useState<Partial<ClinicFormValues>>({});

  function openCreate() {
    setEditingId(undefined);
    setDefaultValues({
      clinicName: "",
      documentNumber: "",
    });
    setOpen(true);
  }

  function openEdit(row: ClinicResponseDto) {
    setEditingId(row.clinicId);
    setDefaultValues({
      clinicName: row.clinicName ?? "",
      documentNumber: row.documentNumber ?? "",
    });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(undefined);
    setDefaultValues({});
  }

  async function submit(dto: any) {
    if (editingId) {
      await update({ ...dto, clinicId: editingId });
    } else {
      await create(dto);
    }
    close();
  }

  return {
    open,
    isFetching: false,
    defaultValues,
    openEdit,
    openCreate,
    close,
    submit,
    saving: isUpdating || isCreating,
    editingId,
  };
}
