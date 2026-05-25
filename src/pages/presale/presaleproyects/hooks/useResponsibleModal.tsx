import { useState } from "react";
import { usePreSaleProyectsMutations } from "@/sharedKernel/hooks/presale/usePreSaleProyects"; 
import { closeAlert, showApiError } from "@/sharedKernel";

export function useResponsibleModal() {
  const [open, setOpen] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<{
    linkToken: string;
    workerId?: number;
    workerName?: string;
    projectCategory?: number; 
  } | null>(null);

  const { updateResponsibleMut } = usePreSaleProyectsMutations();

  function openModal(project: { 
    linkToken: string; 
    workerId?: number; 
    workerName?: string; 
    projectCategory?: number; 
  }) {
    setSelectedProject(project);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSelectedProject(null);
  }

  async function submit(data: { linkToken: string; workerId: number; projectCategory: number }) {
    try {
      await updateResponsibleMut.mutateAsync({
        linkToken: data.linkToken,
        workerId: data.workerId,
        projectCategory: data.projectCategory,
      });
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
    }
  }

  return {
    open,
    close,
    openModal,
    submit,
    saving: updateResponsibleMut.isPending,
    selectedProject,
  };
}