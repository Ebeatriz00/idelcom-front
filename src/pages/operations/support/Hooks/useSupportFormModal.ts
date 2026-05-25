import {
  useCreateSupport,
  useDeleteSupport,
  useSupportById,
  useUpdateSupport,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import type { SupportFormValues } from "../utils/support.schema";

export function useSupportFormModal() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();

  const { data: detail, isFetching } = useSupportById(editingId);
  const { mutateAsync: create, isPending: isCreating } = useCreateSupport();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSupport();
  const { mutateAsync: remove } = useDeleteSupport();

  const [defaultValues, setDefaultValues] = useState<Partial<SupportFormValues>>({});

  useEffect(() => {
    if (detail && editingId) {
      setDefaultValues({
        supportId: detail.supportId,
        provider: detail.provider ?? "",
        service: detail.service ?? "",
        url: detail.url ?? "",
        access: detail.access ?? "",
        email: detail.email ?? "",
        username: detail.username ?? "",
        password: detail.password ?? "",
        supportState: detail.supportState ?? 1,
        startDate: detail.startDate ? detail.startDate.split("T")[0] : "",
        expirationDate: detail.expirationDate ? detail.expirationDate.split("T")[0] : "",
        comments: detail.comments ?? "",
        remarks: detail.remarks ?? "",
      });
    }
  }, [detail, editingId]);

  function openCreate() {
    setEditingId(undefined);
    setDefaultValues({
      provider: "",
      service: "",
      url: "",
      access: "",
      email: "",
      username: "",
      password: "",
      supportState: 1,
      startDate: "",
      expirationDate: "",
      comments: "",
      remarks: "",
    });
    setOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(undefined);
    setDefaultValues({});
  }

  async function submit(dto: any) {
    if (editingId) {
      await update({ ...dto, supportId: editingId });
    } else {
      await create(dto);
    }
    close();
  }

  return {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    remove,
    saving: isCreating || isUpdating,
    editingId,
  };
}
