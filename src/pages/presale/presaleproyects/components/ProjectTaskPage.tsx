import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, List, LayoutGrid } from "lucide-react"; 

import { confirmAction, usePreSaleProyectsDetail } from "@/sharedKernel";
import { useTasksProjectMutations } from "@/sharedKernel/hooks/presale/useTasksProject";
import TasksProject from "./detail/taskProject/tasksProject";
import TasksKanbanProject from "./detail/taskProject/TasksKanbanProject";


export default function ProjectTasksPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [, setBusy] = useState(false);
  
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const { data: projectData, isLoading, isError } =
    usePreSaleProyectsDetail(token);
    if (projectData) {
      if (projectData) {
  };
  }
  
  const {
    statusCompletedMut,
    statusChangeMut,
    statusChangePriorityMut,
    deleteMut
  } = useTasksProjectMutations();

  const handleToggle = useCallback(
    async (taskToken: string) => {
      if (!projectData?.preSaleProyectId) return;
      await statusCompletedMut.mutateAsync({
        linkToken: taskToken,
        projectId: String(projectData.preSaleProyectId),
      });
    },
    [statusCompletedMut, projectData]
  );

  function handleChangeStatus(taskToken: string, status: string | null) {
    if (!projectData?.preSaleProyectId) return;
    statusChangeMut.mutate({
      linkToken: taskToken,
      status: status ?? "",
      projectId: String(projectData.preSaleProyectId),
    });
  }

  function handleChangePriority(taskToken: string, status: string | null) {
    if (!projectData?.preSaleProyectId) return;
    statusChangePriorityMut.mutate({
      linkToken: taskToken,
      status: status ?? "",
      projectId: String(projectData.preSaleProyectId),
    });
  }

  const handleDelete = useCallback(
    async (taskItem: any) => {
      if (!token) return;

      const ok = await confirmAction({
        title: "¿Eliminar tarea?",
        text: "No podrás deshacer esta acción.",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        icon: "warning",
      });
      if (!ok) return;

      setBusy(true);
      try {
        await deleteMut.mutateAsync({
          projectToken: token,
          linkToken: taskItem.tasksToken,
        });
      } finally {
        setBusy(false);
      }
    },
    [deleteMut, token]
  );

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Cargando espacio de trabajo...
      </div>
    );

  if (isError || !projectData)
    return (
      <div className="p-10 text-center text-red-500 font-medium">
        No se encontró el proyecto solicitado.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      
      <div
        className="
          bg-white/95 backdrop-blur-sm
          border border-gray-200
          sticky top-2 z-30
          mx-4 md:mx-6 lg:mx-8 xl:mx-7 2xl:mx-7
          rounded-xl
        "
      >
        <div className="max-w-[1600px] mx-auto px-6">
          
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => navigate(-1)}
              className="
                group flex items-center justify-center p-1.5
                rounded-lg border border-gray-200 bg-white
                text-gray-500 hover:text-gray-900
                hover:border-gray-300 hover:shadow-sm
                transition-all duration-200
              "
              title="Volver atrás"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="
                  inline-flex items-center justify-center
                  px-2 py-0.5 rounded text-[11px]
                  font-bold bg-orange-50 text-orange-600
                  border border-orange-100 shadow-sm
                  whitespace-nowrap tracking-wide
                "
              >
                {projectData.proyectNum}
              </span>

              <h1
                className="text-sm font-semibold text-gray-800 truncate"
                title={projectData.description}
              >
                {projectData.description}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 -mt-1">
            <button 
              onClick={() => setViewMode("list")}
              className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${
                viewMode === "list" ? "text-orange-600 cursor-default" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {viewMode === "list" && (
                <span
                  className="
                    absolute inset-x-0 bottom-0 h-[2px]
                    bg-orange-500 rounded-t-full
                    shadow-[0_-1px_4px_rgba(249,115,22,0.3)]
                  "
                />
              )}
              <div className="flex items-center gap-1.5 relative z-10">
                <List className="size-3.5 stroke-[2.5px]" />
                <span>Lista</span>
              </div>
            </button>

            <button 
              onClick={() => setViewMode("board")}
              className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${
                viewMode === "board" ? "text-orange-600 cursor-default" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {viewMode === "board" && (
                <span
                  className="
                    absolute inset-x-0 bottom-0 h-[2px]
                    bg-orange-500 rounded-t-full
                    shadow-[0_-1px_4px_rgba(249,115,22,0.3)]
                  "
                />
              )}
              <div className="flex items-center gap-1.5 relative z-10">
                <LayoutGrid className="size-3.5 stroke-[2.5px]" />
                <span>Tablero</span>
              </div>
            </button>
          </div>

        </div>
      </div>

      <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {viewMode === "list" ? (
          <TasksProject
            opporToken={token}
            projectId={projectData.preSaleProyectId}
            projectData={projectData}
            onToggle={handleToggle}
            onChangeStatus={handleChangeStatus}
            onChangePriority={handleChangePriority}
            onDelete={handleDelete}
            projectEndDate={projectData.endDate}
          />
        ) : (
          <TasksKanbanProject
            opporToken={token}
            projectId={projectData.preSaleProyectId}
            onToggle={handleToggle}
            onChangeStatus={handleChangeStatus}
            onChangePriority={handleChangePriority}
            onDelete={handleDelete}
            projectEndDate={projectData.endDate}
          />
        )}
      </div>
    </div>
  );
}