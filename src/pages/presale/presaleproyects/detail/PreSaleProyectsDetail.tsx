// ---> AGREGAMOS useLocation AQUÍ
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmAction, usePreSaleProyectsDetail } from "@/sharedKernel"; 
import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects";

import HeaderDetail from "../components/detail/HeaderDetail";
import CardContentGeneralDetail from "../components/detail/InfoGeneral";
import TasksOpportunity from "../components/detail/taskProject/TasksProjectSimple";
import { useTasksProjectMutations } from "@/sharedKernel/hooks/presale/useTasksProject";
import HistoryProject from "../components/detail/historyProject/historyPreSaleProyects";
import ActivityOpportunity from "../components/detail/activityProject/activityProject";
import FileOpportunity from "@/pages/crm/opportunity/components/detail/fileOpp/fileOpportunity";

export default function PreSaleProyectsDetail() {
  const params = useParams();
  const token = params.proyectId || params.id || params.token || "";
  
  const queryClient = useQueryClient();

  const [, setBusy] = useState(false);
  const navigate = useNavigate();
  // ---> LEEMOS EL ESTADO QUE ENVIÓ LA TABLA CON LOS FILTROS
  const location = useLocation();
  const previousFilters = location.state?.fromFilters || "";

  const { data, isLoading, isError } = usePreSaleProyectsDetail(token);
  
  const { 
    statusCompletedMut, 
    statusChangeMut, 
    statusChangePriorityMut, 
    deleteMut 
  } = useTasksProjectMutations(); 


  const handleToggle = useCallback(
    async (taskToken: string) => {
      if (!data?.preSaleProyectId) return;
      await statusCompletedMut.mutateAsync({
        linkToken: taskToken,
        projectId: String(token), 
      });
    },
    [statusCompletedMut, data, token]
  );

  function handleChangeStatusFromPicker(taskToken: string, status: string | null) {
    if (!data?.preSaleProyectId) return;
    statusChangeMut.mutate({
      linkToken: taskToken,
      status: status ?? "",
      projectId: String(token), 
    });
  }

  function handleChangePriorityStatusFromPicker(taskToken: string, status: string | null) {
    if (!data?.preSaleProyectId) return;
    statusChangePriorityMut.mutate({
      linkToken: taskToken,
      status: status ?? "",
      projectId: String(token),
    });
  }

  const confirmDeleteTask = useCallback(
    async (linkToken: string) => {
      if (!token) return;

      const ok = await confirmAction({
        title: "¿Desea eliminar la tarea?",
        text: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar",
        icon: "warning",
      });
      if (!ok) return;

      setBusy(true);
      try {
        await deleteMut.mutateAsync({ 
            projectToken: token, 
            linkToken 
        });
      } finally {
        setBusy(false);
      }
    },
    [deleteMut, token]
  );


  if (isLoading) return <div className="p-6 text-gray-500">Cargando detalle del proyecto...</div>;
  if (isError || !data) return <div className="p-6 text-red-500">Error al cargar los datos.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <HeaderDetail 
            data={data} 
            // ---> AQUÍ CONCATENAMOS LOS FILTROS EXACTOS A LA RUTA
            onBack={() => navigate(`/presale/presaleproyects/presaleproyects${previousFilters}`)} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6">
          <div className="space-y-6">
            
            <CardContentGeneralDetail data={data} />
            
            <div className="mt-2">
                <TasksOpportunity
                  taskList={data.tasksList} 
                  projectId={data.preSaleProyectId}
                  opporToken={token}
                  onToggle={handleToggle}
                  onChangeStatus={handleChangeStatusFromPicker}
                  onChangePriority={handleChangePriorityStatusFromPicker}
                  onDelete={(t) => {
                    const taskToken = (t as any).tasksToken || (t as any).linkToken; 
                    void confirmDeleteTask(taskToken);
                  }}
                />
            </div>

            <FileOpportunity 
                data={data as any} 
                defaultId={data.proyectNum}
                onSuccess={() => {
                   queryClient.invalidateQueries({ 
                      queryKey: qkPreSaleProyects.detailById(token) 
                   });
                }}
            />
          </div>
          
          <div className="space-y-6">
            <ActivityOpportunity data={data}/>
            <HistoryProject data={data}/>
          </div>
        </div>
      </div>
    </div>
  );
}