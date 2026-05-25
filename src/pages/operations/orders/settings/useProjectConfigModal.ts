import { useState } from "react";
import { 
  useConfigProjectById, 
  useConfigProjectMutations,
} from "@/sharedKernel";

export function useProjectConfigModal() {
  const [open, setOpen] = useState(false);
  const [operationsId, setOperationsId] = useState<number | null>(null);

  const { data: configs, isLoading } = useConfigProjectById(operationsId ?? 0);
  const { createMut, updateMut } = useConfigProjectMutations();

  const sortedConfigs = [...(configs || [])].sort((a, b) => (b.shift || 0) - (a.shift || 0));
  const latestConfig = sortedConfigs.length > 0 ? sortedConfigs[0] : null;

  const openModal = (id: number) => {
    setOperationsId(id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOperationsId(null);
  };

  const submit = async (formData: any) => {
    if (!operationsId) return;

    try {
      const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;

      const isCreatingNew = !formData.operationsProjectConfigId;
      
      const basePayload = {
        ...formData,
        operationsId,
        minutesTolerance: formData.allowDelay ? Number(formData.minutesTolerance) : 0,
        entryTime: formatTime(formData.entryTime),
        departureTime: formatTime(formData.departureTime),
        beforeOfficialTime: formatTime(formData.beforeOfficialTime),
        isRequireOvertimeApproval: !!formData.isRequireOvertime,
      };

      let response;
      if (isCreatingNew) {
        const maxShift = Math.max(0, ...((configs || []).map(c => c.shift || 0)));
        response = await createMut.mutateAsync({
          ...basePayload,
          shift: maxShift + 1,
        });
      } else {
        response = await updateMut.mutateAsync(basePayload);
      }

      if (response.status === 1) {
        closeModal();
      }
    } catch (error) {
    }
  };

  return {
    open,
    openModal,
    closeModal,
    submit,
    initialData: latestConfig,
    allConfigs: configs || [],
    hasExistingConfig: !!latestConfig,
    saving: createMut.isPending || updateMut.isPending || (open && isLoading),
  };
}
