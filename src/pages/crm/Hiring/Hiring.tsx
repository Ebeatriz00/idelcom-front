import type { HiringResponseDto, OpportunitiesStateUpdateDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import { useDebouncedValue, useHiringList, useMarkOppFilesRead, useOpportunitiesMutations, useStateTasks } from "@/sharedKernel"; 
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import { useEffect, useState } from "react";
import { HiringTable } from "./components/table/hiringTable";
import { HiringChangeStateFormModal } from "./components/HiringChangeStateFormModal";
import { useHiringChangeStateModal } from "./hooks/useHiringChangeStateModal";
import { FileExplorerDialog } from "../opportunity/components/modal/files/fileOpporDialog";

import { useOpporChangeStateModal } from "../opportunity/hooks/useOpporChangeStateModal";
import { HiringDeliverablesModal } from "./components/HiringDeliverablesModal";
import { updateHiringStatus } from "@/infrastructure/api-clients/crm/hiring/hiring.clients";

import { useTasksMutations } from "../tasks/mutations/useTasksMutation";
import { HiringViewObservationsModal } from "./components/HiringViewObservationsModal";

export default function Hiring() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  
  const [viewObsToken, setViewObsToken] = useState<string | null>(null);
  const [isObsDerived, setIsObsDerived] = useState(false);

  const [fileToken, setFileToken] = useState<string | null>(null);
  const [currentHiringId, setCurrentHiringId] = useState<string | null>(null);

  const deliverablesModal = useOpporChangeStateModal();
  const [isObsReadOnly, setIsObsReadOnly] = useState(false);
  const [isDeliverablesReadOnly] = useState(false);
  const { updateDeliverablesOnlyMut } = useOpportunitiesMutations();
  const { data: taskStateOptions = [] } = useStateTasks();
  
  const { statusChangeMut } = useTasksMutations();
  
  const markReadMut = useMarkOppFilesRead();

  const { data, isLoading, error, refetch } = useHiringList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const silentStatusMut = useMutation({
    mutationFn: updateHiringStatus,
    onSuccess: () => { refetch(); },
    onError: () => {}
  });

  const {
    open, openEdit, close, submit, saving, defaultValues, currentStateDesc, currentOpporNum, 
    currentPreSalesId, currentTypeObs, currentAffects, currentOpporStateId
  } = useHiringChangeStateModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: HiringResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const editingRow = rows.find(r => r.hiringId === defaultValues.hiringId);

  const handleEditStatus = (row: HiringResponseDto) => {
    if (row.hiringId) {
      const currentStatusId = Number(row.licStatusId);
      const taskStateId = (row as any).stateTaskId;
      const opporStateId = Number((row as any).stateOpportunityId); 
      const obsStatusId = Number((row as any).obsStatusId || 0);

      const preSalesId = Number((row as any).statePreSalesId || 0);
      const typeObs = Number((row as any).typeObsClients || 0);
      
      const rawAffects = (row as any).affectsQuotatation; 
      const affectsQuotation = rawAffects === true ? 1 : 0;

      if (currentStatusId === 3) {
          if (obsStatusId !== 7) {
              Swal.fire({
                  icon: "warning",
                  title: "Observación Pendiente",
                  text: "El estado de la observación debe estar completado.",
                  confirmButtonText: "Entendido",
                  confirmButtonColor: "#6c63ff",
              });
              return;
          }
      }

      if (opporStateId === 1 && currentStatusId === 1) {
        Swal.fire({
          icon: "warning",
          title: "Acción requerida",
          text: "Primero debe revisar el archivo adjunto.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#6c63ff",
        });
        return;
      }

      if (currentStatusId === 2 && taskStateId && Number(taskStateId) !== 7) {
        Swal.fire({
          icon: "warning",
          title: "Revisa los datos",
          html: `
            <div style="font-size:20px">
            <b>Aviso:</b> La tarea asociada debe estar completada para cambiar el estado.
            </div>`,
          confirmButtonText: "OK",
          confirmButtonColor: "#6c63ff",
        });
        return;
      }

      if (opporStateId === 3 && currentStatusId === 4) {
        Swal.fire({
          icon: "info",
          title: "Proceso Finalizado",
          text: "El estado ya se encuentra en 'Entregado' y la oportunidad ha finalizado su ciclo de contratación.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#6c63ff",
        });
        return;
      }

      if (opporStateId === 1 && currentStatusId === 4) {
        Swal.fire({
          icon: "info",
          title: "Etapa de Consultoría Finalizada",
          text: "Se ha completado la etapa de consultoria.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#6c63ff",
        });
        return;
      }

      openEdit(
          row.hiringId, 
          row.licStatusId, 
          row.hiringStatus, 
          row.opporNum, 
          preSalesId, 
          typeObs, 
          affectsQuotation,
          opporStateId
      );
    }
  };

  const handleSaveDeliverables = async (dto: OpportunitiesStateUpdateDto) => {
    try {
      await updateDeliverablesOnlyMut.mutateAsync(dto);
      deliverablesModal.close();
      refetch(); 
    } catch (error) {
      console.error("Error guardando entregables", error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStateId: string) => {
      const modalValues = deliverablesModal.defaultValues as any;
      const opporToken = modalValues.linkToken || modalValues.opporToken || ""; 
      const currentTasks = (modalValues.deliverablesHiring as any[]) || [];
      let targetTask = currentTasks.find(
        (t) => String(t.taskId) === String(taskId) || String(t.tasksId) === String(taskId)
      );

      let taskToken = targetTask?.taskToken;

      if (!taskToken) {
          const rowWithTask = rows.find((r: any) => String(r.tasksId) === String(taskId));
          if (rowWithTask) {
              taskToken = (rowWithTask as any).taskToken;
          }
      }

      try {
          await statusChangeMut.mutateAsync({ 
              linkToken: taskToken, 
              status: newStateId, 
              opporToken: opporToken 
          });

          refetch();
          deliverablesModal.close();
      } catch (err) {
          console.error("Error actualizando tarea", err);
      }
  };

  const handleDownloadAction = async (file: any) => {
    const path = (file?.relativePath || file?.path || "").toUpperCase();
    if (fileToken && path.includes("CONTRATACIONES")) {
        markReadMut.mutate({ opporToken: fileToken });
    }
    if (!currentHiringId) return;
    if (file?.archiveType !== "CONSULTORIA") return;

    const currentRow = rows.find(r => String(r.hiringId) === currentHiringId);
    if (!currentRow) return;

    const estadoActual = Number(currentRow.licStatusId);
    if (isNaN(estadoActual)) return;
    const ID_EN_DESARROLLO = 2;
    const ID_ENTREGADO = 4; 

    if (estadoActual === ID_EN_DESARROLLO || estadoActual >= ID_ENTREGADO) return; 

    try {
      await silentStatusMut.mutateAsync({
        hiringId: Number(currentHiringId),
        licStatusId: ID_EN_DESARROLLO, 
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Contrataciones", current: true },
          ]}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <HiringTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            search={search}
            onSearchChange={setSearch}
            onEditStatus={handleEditStatus}
            onOpenDeliverables={(token) => deliverablesModal.openEdit(token)}
            
            onOpenObservations={(token) => {
               setViewObsToken(token);
               const row = rows.find(r => r.linkToken === token || (r as any).opporToken === token || String(r.opporId) === String(token));
               const isDerived = (row as any)?.affectsQuotatation === true;
               setIsObsDerived(isDerived);
               const currentStatus = Number(row?.licStatusId);
               setIsObsReadOnly(currentStatus === 4);
            }}

            onOpenFile={(token) => {
              setFileToken(token);
              const row = rows.find(
                (r: any) =>
                  r.linkToken === token ||  
                  (r as any).opporToken === token || 
                  (r as any).opporId === token
              );
              if (row) {
                setCurrentHiringId(String(row.hiringId));
              }
            }}
            
          />
        </AsyncState>

        <HiringChangeStateFormModal
          open={open}
          onClose={close}
          onSubmit={submit}
          saving={saving}
          defaultValues={defaultValues}
          currentStateLabel={currentStateDesc}
          opporNumber={currentOpporNum}
          
          preSalesId={currentPreSalesId}
          typeObsClients={currentTypeObs} 
          affects={currentAffects}
          opporStateId={currentOpporStateId}
          
          existingFiles={(editingRow as any)?.hiringFiles || []}
          requestNote={(editingRow as any)?.requestNote}
        />

        <HiringDeliverablesModal
          open={deliverablesModal.open}
          loadingDetail={deliverablesModal.isFetching}
          defaultValues={deliverablesModal.defaultValues}
          onClose={deliverablesModal.close}
          onSubmit={handleSaveDeliverables}
          saving={updateDeliverablesOnlyMut.isPending}
          isReadOnly={isDeliverablesReadOnly}
          
          taskStateOptions={taskStateOptions}
          onTaskStatusChange={handleTaskStatusChange}
        />

        {fileToken && (
          <FileExplorerDialog
            open={!!fileToken}
            linkToken={fileToken}
            onClose={() => {
              setFileToken(null);
              setCurrentHiringId(null);
              refetch();
            }}
            title="Explorador de Archivos"
            onPostDownloadAction={handleDownloadAction}
          />
        )}
        <HiringViewObservationsModal
          open={!!viewObsToken}
          onClose={() => {
              setViewObsToken(null);
              refetch(); 
            }}
          projectToken={viewObsToken}
          taskStateOptions={taskStateOptions}
          hasAlreadyDerived={isObsDerived}
          isReadOnly={isObsReadOnly}
          onObservationCreated={() => {
             refetch();
             setIsObsDerived(true);
          }}
        />
      </section>
    </div>
  );
}