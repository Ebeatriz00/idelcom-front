import { useState, useMemo } from "react";
import { 
  useCreateSsomaProcess, 
  useCreateOperationsTeamSsoma, 
  useUpdateOperationsTeamSsoma,
  useSsomaProcessList,
  useProcessSsomaAssignmentRelocation,
  useProcessSsomaAssignmentReplacement,
  confirmAction
} from "@/sharedKernel";
import { fetchActiveSsomaAssignmentByWorkerId } from "@/infrastructure";
import { SsomaAssignmentChangeType } from "@/application";
import type { SsomaProcessUpsertDto } from "@/application";

export function useSsomaProcessRegisterModal() {
  const [open, setOpen] = useState(false);
  const [operationsId, setOperationsId] = useState<number | null>(null);
  const [ssomaProcessId, setSsomaProcessId] = useState<number | null>(null);
  const [workOrderName, setWorkOrderName] = useState<string>("");
  const [plannedDates, setPlannedDates] = useState<{ start?: string | null; end?: string | null }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createProcess, isPending: savingProcess } = useCreateSsomaProcess();
  const { mutateAsync: createTeam, isPending: savingTeam } = useCreateOperationsTeamSsoma();
  const { mutateAsync: updateTeam, isPending: updatingTeam } = useUpdateOperationsTeamSsoma();
  const { mutateAsync: relocateTeam, isPending: relocatingTeam } = useProcessSsomaAssignmentRelocation();
  const { mutateAsync: replaceTeam, isPending: replacingTeam } = useProcessSsomaAssignmentReplacement();

  const { data: ssomaListData, isLoading: loadingExisting } = useSsomaProcessList(
    1,
    5,
    open ? operationsId : null,
    "",
    open && !!operationsId,
  );

  const detectedProcessId = useMemo(() => {
    if (ssomaProcessId) return ssomaProcessId;
    if (!open || !ssomaListData?.items || ssomaListData.items.length === 0) return null;
    const firstItem = ssomaListData.items[0];
    if (operationsId && Number(firstItem.operationsId) === Number(operationsId)) {
      return firstItem.ssomaProcessId;
    }
    return null;
  }, [ssomaListData, ssomaProcessId, operationsId, open]);

  const openModal = (
    opsId: number, 
    woName: string, 
    dates: { start?: string | null; end?: string | null },
    existingProcessId?: number | null
  ) => {
    setOperationsId(opsId);
    setWorkOrderName(woName);
    setPlannedDates(dates);
    setSsomaProcessId(existingProcessId ?? null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOperationsId(null);
    setSsomaProcessId(null);
    setWorkOrderName("");
    setPlannedDates({});
    setIsSubmitting(false);
  };

  const submit = async (comment: string, team: any[]) => {
    if (!operationsId) return;

    setIsSubmitting(true);
    const now = new Date();
    const teamStartDate = plannedDates.start ? plannedDates.start.split("T")[0] : now.toISOString().split("T")[0];
    const teamEndDate = plannedDates.end ? plannedDates.end.split("T")[0] : undefined;

    try {
      let targetProcessId = detectedProcessId;

      if (!targetProcessId) {
        const processData: any = {
          OperationsId: operationsId,
          RequiresCompanyHomologation: true,
          RequieresOperationTeamSsoma: true, 
          CurrentStatusId: 1,
          RequestDate: now.toISOString(),
          StartDate: now.toISOString(),
          GeneralObservation: comment,
          BusinessId: 1, 
          CreateUser: 1
        };

        const processResult = await createProcess(processData as SsomaProcessUpsertDto);
        if (processResult.status === 1) {
          targetProcessId = (processResult as any).id;
        }
      }

      if (targetProcessId && team.length > 0) {
        const toCreate = [];
        const toRelocate = [];
        const toReplace = [];
        const toUpdate = [];

        for (const member of team) {
          if (!member.workerId) continue;

          // SIEMPRE validar si está activo en otro proyecto para todos los casos (Punto 1)
          const active = await fetchActiveSsomaAssignmentByWorkerId(member.workerId);

          if (active && Number(active.ssomaProcessId) !== Number(targetProcessId)) {
            const confirm = await confirmAction({
              title: "Especialista ya asignado",
              text: `El especialista ${active.workerName} ya se encuentra activo en el proyecto "${active.opportunityName}". ¿Desea reubicarlo a este proyecto?`,
              confirmText: "Sí, reubicar",
              cancelText: "No, omitir",
              icon: "question"
            });

            if (confirm) {
              toRelocate.push({
                member,
                oldAssignmentId: active.operationsTeamSsomaId,
                oldProcessId: active.ssomaProcessId
              });
              continue; 
            } else {
              // Si el usuario cancela, no lo agregamos a nada, pasamos al siguiente.
              continue;
            }
          }

          // Clasificación para Reemplazos, Creaciones y Actualizaciones
          if (member.isReplacing && member.operationsTeamSsomaId) {
            toReplace.push(member);
          } else if (!member.operationsTeamSsomaId) {
            toCreate.push(member);
          } else {
            toUpdate.push(member);
          }
        }

        // Ejecutar Reemplazos (Punto 3)
        for (const item of toReplace) {
          await replaceTeam({
            changeType: SsomaAssignmentChangeType.Replacement,
            operationsTeamSsomaId: item.operationsTeamSsomaId,
            ssomaProcessId: targetProcessId,
            fromSsomaProcessId: targetProcessId,
            toSsomaProcessId: targetProcessId,
            workerId: item.workerId,
            ssomaRoleId: item.ssomaRoleId,
            startDate: item.startDate || teamStartDate,
            endDate: item.endDate || teamEndDate,
            isPrimary: item.isPrimary,
            operationsProjectConfigId: item.operationsProjectConfigId,
            sssomaMovementTypeId: 3, 
            movementDate: now.toISOString(),
            reasonChange: "Reemplazo de personal especialista.",
            comments: comment || undefined
          });
        }

        for (const item of toRelocate) {
          await relocateTeam({
            changeType: SsomaAssignmentChangeType.Relocation,
            operationsTeamSsomaId: item.oldAssignmentId,
            ssomaProcessId: targetProcessId,
            fromSsomaProcessId: item.oldProcessId,
            toSsomaProcessId: targetProcessId,
            workerId: item.member.workerId,
            ssomaRoleId: item.member.ssomaRoleId,
            startDate: item.member.startDate || teamStartDate,
            endDate: item.member.endDate || teamEndDate,
            isPrimary: item.member.isPrimary,
            operationsProjectConfigId: item.member.operationsProjectConfigId,
            sssomaMovementTypeId: 1,
            movementDate: now.toISOString(),
            reasonChange: "Reubicación por cambio de proyecto.",
            comments: comment || undefined
          });
        }

        if (toCreate.length > 0) {
          const teamItems = toCreate.map(member => ({
            workerId: member.workerId,
            ssomaRoleId: member.ssomaRoleId,
            startDate: member.startDate || teamStartDate,
            endDate: member.endDate || teamEndDate,
            isPrimary: member.isPrimary,
            isActive: true,
            operationsProjectConfigId: member.operationsProjectConfigId,
            clientApprovalStatusId: 1,
            clientApprovalDate: now.toISOString(),
            comments: comment || undefined,
          }));

          await createTeam({
            ssomaProcessId: targetProcessId,
            teamSsoma: teamItems as any
          });
        }

        if (toUpdate.length > 0) {
          const updateItems = toUpdate.map(member => ({
            operationsTeamSsomaId: member.operationsTeamSsomaId,
            workerId: member.workerId,
            ssomaRoleId: member.ssomaRoleId,
            startDate: member.startDate || teamStartDate,
            endDate: member.endDate || teamEndDate,
            isPrimary: member.isPrimary,
            operationsProjectConfigId: member.operationsProjectConfigId,
          }));

          await updateTeam({
            ssomaProcessId: targetProcessId,
            teamSsoma: updateItems as any
          });
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error al registrar equipo SSOMA:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    open,
    operationsId,
    ssomaProcessId: detectedProcessId,
    workOrderName,
    saving: savingProcess || savingTeam || updatingTeam || relocatingTeam || replacingTeam || loadingExisting || isSubmitting,
    plannedDates,
    openModal,
    closeModal,
    submit,
  };
}
