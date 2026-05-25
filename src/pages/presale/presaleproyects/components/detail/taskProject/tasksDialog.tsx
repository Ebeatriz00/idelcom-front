import type { PriorityStateSelectDto, StateTaskSelectDto } from "@/application";
import StatusPickerDialog from "./states/statusPickerDialog";
import PriorityPickerDialog from "./states/priorityPickerDialog";

export function TaskDialogs({
  panel, anchorEl,
  stateOptions, currentStateId, onSelectState,
  priorityOptions, currentPriorityId, onSelectPriority,
  onClose,
}: {
  panel: "none" | "status" | "priority";
  anchorEl: HTMLElement | null;
  stateOptions: StateTaskSelectDto[];
  currentStateId: string | null;
  onSelectState: (opt: StateTaskSelectDto) => void;
  priorityOptions: PriorityStateSelectDto[];
  currentPriorityId: string | null;
  onSelectPriority: (opt: PriorityStateSelectDto | null) => void;
  onClose: () => void;
}) {
  return (
    <>
      <StatusPickerDialog
        open={panel === "status"}
        anchorEl={anchorEl}
        options={stateOptions}
        valueId={currentStateId}
        onSelect={onSelectState}
        onClose={onClose}
        title="Cambiar estado"
      />
      <PriorityPickerDialog
        open={panel === "priority"}
        anchorEl={anchorEl}
        options={priorityOptions}
        valueId={currentPriorityId}
        onSelect={onSelectPriority}
        onClose={onClose}
        title="Cambiar prioridad"
      />
    </>
  );
}