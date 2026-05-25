import { useState } from "react";
import { useClientsActivityMutations } from "@/sharedKernel";
import { useActivityState } from "@/sharedKernel/hooks/Activity/useActivityState"; 
import { TimelineStatePickerDialog } from "./TimelineStatePickerDialog";

interface Props {
  clientsActivityId: number;
  currentClientId: number;
  initialStateId: number;
  initialStateColor: string;
  initialStateDesc: string;
}


function decodeIdFromToken(token?: string): number {
  if (!token) return 0;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return 0;
    
    const payload = atob(parts[1]);
    const data = JSON.parse(payload);
    return Number(data.rid || 0);
  } catch (error) {
    console.error("Error decodificando token:", error);
    return 0;
  }
}

export function TimelineStatusSelector({
  clientsActivityId,
  currentClientId,
  initialStateId,
  initialStateColor,
  initialStateDesc,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { statusMut } = useClientsActivityMutations(currentClientId);
  const { data: rawStates } = useActivityState();

  const options = ((rawStates as any[]) ?? []).map((s) => {
    const realId = s.activityStateId ?? s.id ?? decodeIdFromToken(s.linkToken);

    return {
      value: realId, 
      label: s.stateDesc,       
      stateColor: s.stateColor  
    };
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (opt: any) => {
    const newStateId = Number(opt.value);

    if (newStateId > 0 && newStateId !== initialStateId) {
      statusMut.mutate({
        clientsActivityId,
        activityStateId: newStateId,
      });
    }
    handleClose();
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className="mb-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
        style={{
          color: initialStateColor,
          backgroundColor: `${initialStateColor}15`,
          border: `1px solid ${initialStateColor}30`,
        }}
        title="Clic para cambiar estado"
      >
        {initialStateDesc}
      </button>

      <TimelineStatePickerDialog
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        options={options} 
        valueId={initialStateId}
        onSelect={handleSelect}
        onClose={handleClose}
        title="Cambiar Estado"
      />
    </div>
  );
}