import { useAuthPerms } from "@/sharedKernel";

export function useCrmQualificationPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewQualification = !isLoading && has("leads_qualification", "view_module");
  const canViewAllQualification = !isLoading && has("leads_qualification", "all_list");

  /*ACCIONES*/
  const canCreateQualification = !isLoading && has("leads_qualification", "create");
  const canEditQualification = !isLoading && has("leads_qualification", "edit");
  const canEditStatusQualification =
    !isLoading && has("leads_qualification", "edit_status");
  const canDeleteQualification = !isLoading && has("leads_qualification", "eliminate");
  const canExportQualification = !isLoading && has("leads_qualification", "export");

  return {
    isLoadingPerms: isLoading,
    canViewQualification,
    canViewAllQualification,
    canCreateQualification,
    canEditQualification,
    canEditStatusQualification,
    canDeleteQualification,
    canExportQualification,
  };
}
