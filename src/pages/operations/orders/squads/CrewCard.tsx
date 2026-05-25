import type {
  OperationsPersonnelAssignmentResponseDto,
  OperationsSquadResponseDto,
} from "@/application";
import { Users, Pencil, UserCog, X } from "lucide-react";

interface CrewCardProps {
  crew: OperationsSquadResponseDto;
  members: OperationsPersonnelAssignmentResponseDto[];
  onAddMember: () => void;
  onEdit: (crew: OperationsSquadResponseDto) => void;
  onDeleteMember: (assignmentId: number) => void;
}

export function CrewCard({ crew, members, onAddMember, onEdit, onDeleteMember }: CrewCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm w-full mb-3">
      <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="text-xs font-black text-slate-800 truncate" title={crew.squadName}>
            {crew.squadName}
          </h4>
          <span className="shrink-0 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-black border border-blue-100/50 flex items-center gap-1">
            <Users className="size-2.5" />
            {members.length}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 pl-2">
          <button onClick={() => onEdit(crew)} className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title="Editar Cuadrilla">
            <Pencil className="size-3" />
          </button>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 bg-indigo-50/50 p-1.5 rounded border border-indigo-50/80">
          <UserCog className="size-3 text-indigo-500 shrink-0" />
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none shrink-0">Líder:</p>
            <p className="text-[10px] font-bold text-indigo-900 truncate leading-none">{crew.techLeaderName || "Sin asignar"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.assignmentId}
                className="group flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md pl-1.5 pr-0.5 py-0.5 hover:border-blue-300 transition-colors"
              >
                <span className="text-[9px] font-bold text-slate-600 truncate max-w-[200px]" title={member.workerName}>
                  {member.workerName || "Sin nombre"}
                </span>
                <button
                  onClick={() => onDeleteMember(member.assignmentId)}
                  className="p-0.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover trabajador"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-1 bg-slate-50 border border-dashed border-gray-200 rounded">
              <span className="text-[9px] font-bold text-slate-400">Sin personal asignado</span>
            </div>
          )}
        </div>

        <button
          onClick={onAddMember}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 bg-slate-50 border border-gray-200 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
        >
          <Users className="size-3" />
          Gestionar Personal
        </button>
      </div>
    </div>
  );
}