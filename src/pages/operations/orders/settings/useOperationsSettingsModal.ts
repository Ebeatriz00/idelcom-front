import { useState } from "react";
import { 
  useUpdateOperations, 
  useOperationsById, 
  useSsomaOperationsRequirementMutations, 
  useSsomaOperationsRequirementList,
} from "@/sharedKernel";
import type { OperationsUpdateDto } from "@/application";
import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import type { OperationsWorkOrderResponseDto } from "@/application/dtos/operations/workOrder/workOrder.dto";
import type { OperationsPersonnelAssignmentResponseDto } from "@/application/dtos/operations/assignment/assignment.dto";
import type { OperationsProjectConfigResponseDto } from "@/application/dtos/operations/configProject/configProject.dto";
import type { OperationsSquadResponseDto } from "@/application/dtos/operations/squad/squad.dto";
import type { OperationsTeamSsomaListItemDto } from "@/application/dtos/operations/operationsTeamSsoma/operationsTeamSsoma.dto";
import { useQueryClient } from "@tanstack/react-query";
import { qkOrders } from "@/sharedKernel/hooks/operations/orders/keys/qkOrders";
import { fetchOperationsSquadList } from "@/infrastructure";
import { fetchOperationsTeamSsomaListByProcessId } from "@/infrastructure";
import { generateOperationClosurePdf } from "../utils/generateOperationClosurePdf";

const RELEASE_STATUS_IDS = [4, 5, 7, 8];
const STATUS_NAMES: Record<number, string> = {
  4: "En Pausa",
  5: "Retrasado",
  7: "Cerrado",
  8: "Cancelado",
};

export interface OperationsSettingsContext {
  selectedOrder?: OrdersResponseDto | null;
  workOrders?: OperationsWorkOrderResponseDto[];
  assignmentData?: OperationsPersonnelAssignmentResponseDto[];
  projectConfigs?: OperationsProjectConfigResponseDto[];
  ssomaProcessId?: number | null;
}

export function useOperationsSettingsModal(
  onSuccess?: () => void,
  context?: OperationsSettingsContext
) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: detailData, isLoading: loadingData } = useOperationsById(selectedId ?? 0);
  const { data: assignedResult } = useSsomaOperationsRequirementList(selectedId ?? 0, 1, 100);
  
  const { mutateAsync: update, isPending: updating } = useUpdateOperations();
  const { createMut, deleteMut } = useSsomaOperationsRequirementMutations();

  const openModal = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedId(null);
  };

  /**
   * Genera el PDF de cierre/pausa con toda la información del proyecto.
   * Se ejecuta ANTES de que el SP libere al personal para capturar la foto completa.
   */
  const generateClosurePdf = async (newStatusId: number): Promise<File | void> => {
    if (!context?.selectedOrder || !detailData) return;

    try {
      const workOrders = context.workOrders || [];
      const squadsMap: Record<number, OperationsSquadResponseDto[]> = {};

      for (const wo of workOrders) {
        try {
          const squadsResult = await fetchOperationsSquadList(1, 50, wo.workOrderId);
          squadsMap[wo.workOrderId] = squadsResult?.items || [];
        } catch {
          squadsMap[wo.workOrderId] = [];
        }
      }

      let ssomaTeam: OperationsTeamSsomaListItemDto[] = [];
      if (context.ssomaProcessId) {
        try {
          ssomaTeam = await fetchOperationsTeamSsomaListByProcessId(context.ssomaProcessId);
        } catch {
          ssomaTeam = [];
        }
      }

      return await generateOperationClosurePdf({
        selectedOrder: context.selectedOrder,
        opDetail: detailData,
        projectConfigs: context.projectConfigs || [],
        workOrders,
        squadsMap,
        assignmentData: context.assignmentData || [],
        ssomaTeam,
        ssomaRequirements: assignedResult?.items || [],
        newStatusName: STATUS_NAMES[newStatusId] || "Cambio de Estado",
      });
    } catch (error) {
      console.error("Error al generar PDF de cierre:", error);
    }
  };

  const submit = async (formData: any) => {
    if (!selectedId) return;

    try {
      const { ssomaRequirementIds, ...operationsData } = formData;
      const currentAssigned = assignedResult?.items || [];
      
      const selectedIds = (ssomaRequirementIds || []).map(Number);

      const newStatusId = operationsData.operationsStatusId;

      let closurePdfFile: File | undefined = undefined;
      if (RELEASE_STATUS_IDS.includes(newStatusId)) {
        const file = await generateClosurePdf(newStatusId);
        if (file) {
          closurePdfFile = file;
        }
      }

      const payload: any = {
        ...operationsData,
        operationsId: selectedId,
      };
      if (closurePdfFile) {
        payload.closurePdfFile = closurePdfFile;
      }

      const resp = await update(payload as OperationsUpdateDto);

      if (resp.status === 1) {
        
        const toDelete = currentAssigned.filter(
          item => !selectedIds.includes(item.requirementId)
        );
        for (const item of toDelete) {
          await deleteMut.mutateAsync(item.operationsRequirementId);
        }

        const alreadyInDb = currentAssigned.map(item => item.requirementId);
        const toCreate = selectedIds.filter((id: number) => !alreadyInDb.includes(id));
        
        if (operationsData.requeredSsoma) {
          for (const requirementId of toCreate) {
            await createMut.mutateAsync({
              operationsId: selectedId,
              requirementId: requirementId,
              isMandatory: true,
              validDays: 0
            });
          }
        }

        queryClient.invalidateQueries({ queryKey: qkOrders.all });
        closeModal();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error en submit:", error);
    }
  };

  return {
    open,
    openModal,
    closeModal,
    submit,
    saving: updating || createMut.isPending || deleteMut.isPending || (open && loadingData),
    initialData: detailData,
  };
}
