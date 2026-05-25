import { useClientDetail, useClientsActivityList } from "@/sharedKernel"; 
import { AsyncState } from "@/layouts";
import { useParams } from "react-router-dom";
import { ClientsDetailContacts } from "./ClientsDetailContacts";
import { ClientsDetailHeader } from "./ClientsDetailHeader";
import { ClientsDetailPipeline } from "./ClientsDetailPipeline";
import { ClientsDetailTimeline } from "./ClientsDetailTimeline";
import { ActivityTrendChart } from "./ActivityTrendChart";

export default function ClientsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);

  const { data, isLoading, error, refetch: refetchDetails } = useClientDetail(clientId);

  const { data: activityData, refetch: refetchActivities } = useClientsActivityList(clientId, 1, 100);
  
  const chartActivities = (activityData as any)?.items ?? [];

  const pipeline = data?.pipeline ?? [];
  const contacts = data?.contacts ?? [];

  const handleRefresh = () => {
    refetchDetails();  
    refetchActivities(); 
  };

  return (
    <div className="space-y-6 pb-10">
      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={!data}
        emptyMessage="No se encontró información del cliente."
      >
        {data?.header && <ClientsDetailHeader header={data.header} />}

        {data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            <div className="space-y-6 lg:col-span-1">
              <ActivityTrendChart activities={chartActivities} />
              
              <ClientsDetailContacts contacts={contacts} />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <ClientsDetailPipeline pipeline={pipeline} />

              <ClientsDetailTimeline 
                clientsId={clientId} 
                onActivityAdded={handleRefresh} 
              />
              
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}