import { useAuthPerms } from "@/sharedKernel";

export function useOpAccExPerPerms() {
  const { has, isLoading } = useAuthPerms();

  /*VISUALIZACIONES*/
  const canViewExPer =
    !isLoading && has("operations_exercise_periods", "view_module");
  const canViewAllExPer =
    !isLoading && has("operations_exercise_periods", "all_list");

  /*ACCIONES*/
  const canCreateExPer =
    !isLoading && has("operations_exercise_periods", "create");
  const canEditExPer = !isLoading && has("operations_exercise_periods", "edit");
  const canEditStatusExPer =
    !isLoading && has("operations_exercise_periods", "edit_status");
  const canDeleteExPer =
    !isLoading && has("operations_exercise_periods", "eliminate");
  const canExportExPer =
    !isLoading && has("operations_exercise_periods", "export");

  return {
    isLoadingPerms: isLoading,
    canViewExPer,
    canViewAllExPer,
    canCreateExPer,
    canEditExPer,
    canEditStatusExPer,
    canDeleteExPer,
    canExportExPer,
  };
}
