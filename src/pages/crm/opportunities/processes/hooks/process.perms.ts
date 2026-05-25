import { useAuthPerms } from "@/sharedKernel";

export function useCrmProcessPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewProcess =
    !isLoading && has("opportunities_processes", "view_module");
  const canViewAllProcess =
    !isLoading && has("opportunities_processes", "all_list");

  /*ACCIONES*/
  const canCreateProcess =
    !isLoading && has("opportunities_processes", "create");
  const canEditProcess = !isLoading && has("opportunities_processes", "edit");
  const canEditStatusProcess =
    !isLoading && has("opportunities_processes", "edit_status");
  const canDeleteProcess =
    !isLoading && has("opportunities_processes", "eliminate");
  const canExportProcess =
    !isLoading && has("opportunities_processes", "export");

  return {
    isLoadingPerms: isLoading,
    canViewProcess,
    canViewAllProcess,
    canCreateProcess,
    canEditProcess,
    canEditStatusProcess,
    canDeleteProcess,
    canExportProcess,
  };
}
