import { useSquadList } from "@/sharedKernel";
import { CrewCard } from "./CrewCard";
import { Users } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

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
        <Droppable droppableId={workOrderId.toString()}>
          {(provided, snapshot) => (
            <div 
              className={`flex flex-col gap-1 min-h-[100px] p-1 rounded-lg transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-orange-50/60 ring-2 ring-orange-200 border border-orange-200/50' : 'border border-transparent'}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {squads.map((crew, index) => (
                <Draggable key={crew.squadId} draggableId={crew.squadId.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-200 rounded-lg !cursor-default ${snapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-1 z-50 ring-2 ring-orange-400 opacity-90' : ''}`}
                    >
                      <CrewCard
                        crew={crew}
                        members={getMembersBySquad(crew.squadId, assignmentData)}
                        onAddMember={() => onAddMember(crew.squadId)}
                        onEdit={(data) => onEditCrew(workOrderId, data)}
                        onDeleteMember={onDeleteMember}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <Droppable droppableId={workOrderId.toString()}>
          {(provided, snapshot) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-12 rounded-xl text-center flex flex-col items-center justify-center gap-4 min-h-[150px] transition-colors duration-200 ${
                snapshot.isDraggingOver 
                  ? 'bg-orange-50/60 ring-2 ring-orange-200 border border-orange-200/50' 
                  : 'bg-slate-50 border border-dashed border-gray-200'
              }`}
            >
              <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
                <Users className="size-8 text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin cuadrillas activas</p>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
