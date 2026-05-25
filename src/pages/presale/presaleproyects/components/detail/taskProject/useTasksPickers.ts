import type {
  PriorityStateSelectDto,
  StateTaskSelectDto,
} from "@/application"; 
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import { useState } from "react";

type TaskItem = NonNullable<PreSaleProyectsDetailDto["tasksList"]>[number];

export function useTaskPickers(
  stateOptions: StateTaskSelectDto[],
  priorityOptions: PriorityStateSelectDto[],
  onChangeStatus: (taskToken: string, lineToken: string | null) => void,
  onChangePriority: (taskToken: string, lineToken: string | null) => void
) {
  const [panel, setPanel] = useState<"none" | "status" | "priority">("none");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTaskToken, setSelectedTaskToken] = useState<string | null>(null);
  const [currentStateId, setCurrentStateId] = useState<string | null>(null);
  const [currentPriorityStateId, setPriorityStateId] = useState<string | null>(null);

  const [optimisticCallback, setOptimisticCallback] = useState<((id: number) => void) | null>(null);

  const openStatus = (t: TaskItem, anchor: HTMLElement) => {
    const token = (t as any).tasksToken as string;
    setSelectedTaskToken(token);
    setAnchorEl(anchor);
    const match = stateOptions.find(
      (o) => o.stateDesc === (t.statusTasks ?? "")
    );
    setCurrentStateId(match?.lineToken ?? null); 
    setPanel("status");
  };

  const openPriority = (t: TaskItem, anchor: HTMLElement, cb?: (id: number) => void) => {
    const token = (t as any).tasksToken as string;
    setSelectedTaskToken(token);
    setAnchorEl(anchor);

    setOptimisticCallback(() => cb || null);

    const match = priorityOptions.find(
      (o) => o.priorityDesc === (t.priorityDesc ?? "")
    );
    setPriorityStateId(match?.linkToken ?? null);
    setPanel("priority");
  };

  const close = () => {
    setPanel("none");
    setAnchorEl(null);
    setSelectedTaskToken(null);
    setOptimisticCallback(null);
  };

  const selectStatus = (opt: StateTaskSelectDto) => {
    if (selectedTaskToken) onChangeStatus(selectedTaskToken, opt.lineToken); 
    close();
  };

  const selectPriority = (opt: PriorityStateSelectDto | null) => {
    if (opt && optimisticCallback) {

        const newId = (opt as any).priorityStateId ?? Number(opt.linkToken);
        if (!isNaN(newId)) {
            optimisticCallback(newId);
        }
    }

    if (selectedTaskToken)
      onChangePriority(selectedTaskToken, opt?.linkToken ?? null);
    
    close();
  };

  return {
    panel,
    anchorEl,
    currentStateId,
    currentPriorityStateId,
    openStatus,
    openPriority,
    close,
    selectStatus,
    selectPriority,
  };
}