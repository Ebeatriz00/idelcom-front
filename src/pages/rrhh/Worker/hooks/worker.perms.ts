import { useAuthPerms } from "@/sharedKernel";

export function useHrWorkerPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewWorker = !isLoading && has("hr_workers", "view_module");
  const canViewAllWorker = !isLoading && has("hr_workers", "all_list");

  /*ACCIONES*/
  const canCreateWorker = !isLoading && has("hr_workers", "create");
  const canEditWorker = !isLoading && has("hr_workers", "edit");
  const canEditStatusWorker = !isLoading && has("hr_workers", "edit_status");
  const canDeleteWorker = !isLoading && has("hr_workers", "eliminate");
  const canExportWorker = !isLoading && has("hr_workers", "export");

  return {
    isLoadingPerms: isLoading,
    canViewWorker,
    canViewAllWorker,
    canCreateWorker,
    canEditWorker,
    canEditStatusWorker,
    canDeleteWorker,
    canExportWorker,
  };
}
