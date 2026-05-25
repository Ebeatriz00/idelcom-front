// state/useActivityPicker.ts
import type {
  ActivityStateSelectDto,
  PriorityStateSelectDto,
} from "@/application";
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import { useState } from "react";

type ActivityItem = NonNullable<PreSaleProyectsDetailDto["activityList"]>[number];

export function useActivityPickers(
  stateOptions: ActivityStateSelectDto[],
  priorityOptions: PriorityStateSelectDto[],
  onChangeStatus?: (opperToken: string, lineToken: string | null) => void,
  onChangePriority?: (opperToken: string, lineToken: string | null) => void
) {
  const [panel, setPanel] = useState<"none" | "status" | "priority">("none");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedOpperToken, setSelectedOpperToken] = useState<string | null>(
    null
  );
  const [currentStateId, setCurrentStateId] = useState<string | null>(null);
  const [currentPriorityStateId, setPriorityStateId] = useState<string | null>(
    null
  );

  const openStatusAc = (t: ActivityItem, anchor: HTMLElement) => {
    const token = (t as any).linkToken as string;
    setSelectedOpperToken(token);
    setAnchorEl(anchor);
    const match = stateOptions.find(
      (o) => o.stateDesc === (t.activityState ?? "")
    );
    setCurrentStateId(match?.linkToken ?? null);
    setPanel("status");
  };

  const openPriorityAc = (t: ActivityItem, anchor: HTMLElement) => {
    const token = (t as any).linkToken as string;
    setSelectedOpperToken(token);
    setAnchorEl(anchor);
    const match = priorityOptions.find(
      (o) => o.priorityDesc === (t.activityPriority ?? "")
    );
    setPriorityStateId(match?.linkToken ?? null);
    setPanel("priority");
  };

  const close = () => {
    setPanel("none");
    setAnchorEl(null);
    setSelectedOpperToken(null);
  };

  const selectStatus = (opt: ActivityStateSelectDto) => {
    if (selectedOpperToken)
      onChangeStatus?.(selectedOpperToken, opt.linkToken ?? null);
    close();
  };

  const selectPriority = (opt: PriorityStateSelectDto | null) => {
    if (selectedOpperToken)
      onChangePriority?.(selectedOpperToken, opt?.linkToken ?? null);
    close();
  };

  return {
    panel,
    anchorEl,
    currentStateId,
    currentPriorityStateId,
    openStatusAc,
    openPriorityAc,
    close,
    selectStatus,
    selectPriority,
  };
}
