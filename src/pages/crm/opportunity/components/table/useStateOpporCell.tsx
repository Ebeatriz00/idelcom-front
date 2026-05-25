import type { OpportunitiesResponseDto } from "@/application";
import { makeStateBadgeCell } from "@/layouts";
import { useMemo } from "react";
import { toastWarn } from "./helpers";
import { canOpenChangeState } from "./opportunityGuards";

type Props = {
  onOpenStateModal: (row: OpportunitiesResponseDto) => void;
  selectRow: (id: string) => void;
  openEdit: (id: string) => void;
};

export function useStateOpporCell({
  onOpenStateModal,
  selectRow,
  openEdit,
}: Props) {
  return useMemo(
    () =>
      makeStateBadgeCell({
        descField: "stateOpporDesc",
        colorField: "stateColor",
        onOpen: (row?: any) => {
          const original = row?.original ?? row;
          const id = original?.linkToken;
          if (!id) return;

          const guard = canOpenChangeState(original);

          if (!guard.ok) {
            if (guard.forceOpen) {
              selectRow(id);
              openEdit(id);
              return;
            }

            toastWarn(guard.msg);
            return;
          }

          selectRow(id);
          onOpenStateModal(original);
        },
      }),
    [onOpenStateModal, selectRow, openEdit],
  );
}
