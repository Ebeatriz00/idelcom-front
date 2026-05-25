import {
  confirmAction,
  useDetailOpportunities,
  useTasksMutations,
} from "@/sharedKernel";
import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActivityOpportunity from "../components/detail/activityOpp/activityOpportunity";
import FileOpportunity from "../components/detail/fileOpp/fileOpportunity";
import HeaderDetail from "../components/detail/header";
import HistoryOpportunity from "../components/detail/historyOpp/historyOpportunity";
import CardContentActivityDetail from "../components/detail/infoOpp/InfoOpportunity";
import InfoQuote from "../components/detail/infoQuote/infoQuoteOpportunity";
import TasksOpportunity from "../components/detail/taskOpp/tasksOpportunity";

export default function OpportunityDetail() {
  const { opporId } = useParams();
  const [, setBusy] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const previousFilters = location.state?.fromFilters || "";

  
  const { data, isLoading, isError } = useDetailOpportunities(String(opporId));

  const {
    statusCompletedMut,
    statusChangeMut,
    statusChangePriorityMut,
    deleteMut,
  } = useTasksMutations();

  const handleToggle = useCallback(
    async (taskToken: string) => {
      if (!opporId) return;
      await statusCompletedMut.mutateAsync({
        linkToken: taskToken,
        opporToken: String(opporId),
      });
    },
    [statusCompletedMut, opporId]
  );

  const handleChangeStatusFromPicker = useCallback(
    (taskToken: string, status: string | null) => {
      if (!opporId) return;
      statusChangeMut.mutate({
        linkToken: taskToken,
        status: status ?? "",
        opporToken: String(opporId),
      });
    },
    [statusChangeMut, opporId]
  );

  const handleChangePriorityStatusFromPicker = useCallback(
    (taskToken: string, status: string | null) => {
      if (!opporId) return;
      statusChangePriorityMut.mutate({
        linkToken: taskToken,
        status: status ?? "",
        opporToken: String(opporId),
      });
    },
    [statusChangePriorityMut, opporId]
  );

  const confirmDeleteTask = useCallback(
    async (linkToken: string, opporToken: string) => {
      const ok = await confirmAction({
        title: "¿Desea eliminar la actividad?",
        text: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar",
        icon: "warning",
      });
      if (!ok) return;

      setBusy(true);
      try {
        await deleteMut.mutateAsync({ opporToken, linkToken });
      } finally {
        setBusy(false);
      }
    },
    [deleteMut]
  );
  if (isLoading)
    return <p className="p-6 text-gray-500">Cargando detalle...</p>;
  if (isError || !data)
    return <p className="p-6 text-red-500">No se pudo cargar el detalle.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <HeaderDetail data={data} onBack={() => navigate(`/crm/opportunity${previousFilters}`)} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6">
          <div className="space-y-6">
            <CardContentActivityDetail data={data} />
            <TasksOpportunity
              taskList={data.tasksList}
              onToggle={handleToggle}
              onChangeStatus={handleChangeStatusFromPicker}
              onChangePriority={handleChangePriorityStatusFromPicker}
              onDelete={(t) => {
                const taskToken = (t as any).tasksToken;
                const opporToken = String(opporId);
                void confirmDeleteTask(taskToken, opporToken);
              }}
              opporToken={data.linkToken}
              opporDesc={data.opporDesc}
            />
            <FileOpportunity data={data} />
          </div>

          <div className="space-y-6">
            <ActivityOpportunity data={data} />

            <InfoQuote data={data} />
            <HistoryOpportunity data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
