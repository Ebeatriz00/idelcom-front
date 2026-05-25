import { useSquadList } from "@/sharedKernel";
import { CrewCard } from "./CrewCard";
import { Users } from "lucide-react";

const getMembersBySquad = (squadId: number, assignmentData: any) => {
  return assignmentData?.items?.filter((a: any) => a.squadId === squadId) || [];
};

export function SquadList({
  workOrderId,
  assignmentData,
  onAddMember,
  onEditCrew,
  onDeleteMember,
}: {
  workOrderId: number;
  assignmentData: any;
  onAddCrew: (woId: number) => void;
  onAddMember: (squadId: number) => void;
  onEditCrew: (woId: number, data: any) => void;
  onDeleteMember: (assignmentId: number) => void;
}) {
  const { data: squadData, isLoading } = useSquadList(0, 50, workOrderId);
  const squads = squadData?.items || [];

  if (isLoading)
    return <div className="p-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Cargando cuadrillas...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {squads.length} Cuadrilla{squads.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {squads.length > 0 ? (
        <div className="flex flex-col gap-1">
          {squads.map((crew) => (
            <CrewCard
              key={crew.squadId}
              crew={crew}
              members={getMembersBySquad(crew.squadId, assignmentData)}
              onAddMember={() => onAddMember(crew.squadId)}
              onEdit={(data) => onEditCrew(workOrderId, data)}
              onDeleteMember={onDeleteMember}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-slate-50 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
            <Users className="size-8 text-slate-300" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin cuadrillas activas</p>
        </div>
      )}
    </div>
  );
}
