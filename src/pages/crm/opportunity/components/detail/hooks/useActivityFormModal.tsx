// hooks/useActivityFormModal.ts
import type { ActivityOpporCreateDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useACOpportunitiesMutations,
} from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useActivityFormModal() {
  const [open, setOpen] = useState(false);
  const { createACMut } = useACOpportunitiesMutations();

  const openCreate = () => setOpen(true);
  const close = () => setOpen(false);

  const defaultValues = useMemo<ActivityOpporCreateDto>(
    () => ({
      opporToken: "", // se seteará dinámicamente
      workerSenderId: undefined,
      activityState: undefined,
      activityType: undefined,
      activityPriority: undefined,
      activityMessage: "",
      activityAddition: "",
    }),
    []
  );

  async function submit(dto: ActivityOpporCreateDto) {
    try {
      await createACMut.mutateAsync(dto);
      close();
    } catch (err) {
      await showApiError(err);
    } finally {
      closeAlert();
    }
  }

  const saving = createACMut.isPending;

  return {
    open,
    openCreate,
    close,
    submit,
    defaultValues,
    saving,
  };
}
