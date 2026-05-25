import { useAuthPerms } from "@/sharedKernel";

export function useHrJobTitlePerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewJobTitle = !isLoading && has("hr_job_titles", "view_module");
  const canViewAllJobTitle = !isLoading && has("hr_job_titles", "all_list");

  /*ACCIONES*/
  const canCreateJobTitle = !isLoading && has("hr_job_titles", "create");
  const canEditJobTitle = !isLoading && has("hr_job_titles", "edit");
  const canEditStatusJobTitle =
    !isLoading && has("hr_job_titles", "edit_status");
  const canDeleteJobTitle = !isLoading && has("hr_job_titles", "eliminate");
  const canExportJobTitle = !isLoading && has("hr_job_titles", "export");

  return {
    isLoadingPerms: isLoading,
    canViewJobTitle,
    canViewAllJobTitle,
    canCreateJobTitle,
    canEditJobTitle,
    canEditStatusJobTitle,
    canDeleteJobTitle,
    canExportJobTitle,
  };
}
