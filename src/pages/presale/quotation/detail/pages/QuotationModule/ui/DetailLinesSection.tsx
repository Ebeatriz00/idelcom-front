import { useEffect, useMemo, useState } from "react";
import { mapDtoLinesToUi } from "../types";
import {
  computeDescCount,
  filterVisibleRows,
} from "../utils/detailLines.collapse";
import { DetailLinesCard } from "./DetailLinesCard";
import { DetailLinesTable } from "./DetailLinesTable";
import { filterNormalTree } from "./filterPresalesTree";

const TOGGLE_MIN_ROWS = 5; // ✅ 5 filas o más

export function DetailLinesSection({
  data,
  footer,
  onAddGroup,
  onAddItem,
}: {
  data: any;
  footer?: React.ReactNode;
  onAddGroup?: () => void;
  onAddItem?: () => void;
}) {
  const rows = useMemo(() => mapDtoLinesToUi(data?.lines ?? []), [data?.lines]);

  const presalesNoTree = useMemo(() => filterNormalTree(rows), [rows]);

  const descCount = useMemo(
    () => computeDescCount(presalesNoTree),
    [presalesNoTree],
  );
  const [collapsed, setCollapsed] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    setCollapsed((prev) => {
      if (prev.size) return prev;

      const s = new Set<string | number>();

      // ✅ detecta roots
      const rootIds = new Set(
        presalesNoTree.filter((r) => r.parentId == null).map((r) => r.id),
      );

      for (const r of presalesNoTree) {
        if (!r.isCollapsible) continue;

        // ✅ NO colapsar roots (si no, matas todo)
        if (rootIds.has(r.id)) continue;

        const d = descCount.get(r.id) ?? 0;
        if (d >= TOGGLE_MIN_ROWS) s.add(r.id);
      }

      return s;
    });
  }, [presalesNoTree, descCount]);

  const toggleGroup = (id: string | number) => {
    const key = String(id);
    setCollapsed((prev) => {
      const next = new Set(Array.from(prev).map(String));
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const canToggle = (id: string | number) =>
    (descCount.get(String(id)) ?? descCount.get(id) ?? 0) >= TOGGLE_MIN_ROWS;

  const withParent = presalesNoTree.filter((r) => r.parentId != null).length;
  const withoutParent = presalesNoTree.length - withParent;

  console.log("normalTree size", presalesNoTree.length);
  console.log("withParent", withParent, "withoutParent", withoutParent);

  // ids que tienen parentId pero ese parent NO existe en el subset
  const ids = new Set(presalesNoTree.map((r) => String(r.id)));
  const brokenRefs = presalesNoTree.filter(
    (r) => r.parentId != null && !ids.has(String(r.parentId)),
  );

  console.log("brokenRefs", brokenRefs.length);
  console.log(
    "sample brokenRefs",
    brokenRefs.slice(0, 10).map((r) => ({
      id: r.id,
      pid: r.parentId,
      dn: r.displayNo,
    })),
  );

  const visibleRows = useMemo(
    () => filterVisibleRows(presalesNoTree, collapsed),
    [presalesNoTree, collapsed],
  );

  console.log("TOTAL rows", rows.length);
  console.log(
    "items strict red",
    rows.filter((r) => r.kind === "ITEM" && r.isPresalesStrict).length,
  );
  console.log(
    "items strict black",
    rows.filter((r) => r.kind === "ITEM" && !r.isPresalesStrict).length,
  );

  console.log(
    "items mixed isPresales",
    rows.filter((r) => r.kind === "ITEM" && r.isPresales).length,
  );

  return (
    <DetailLinesCard
      onAddGroup={onAddGroup}
      onAddItem={onAddItem}
      footer={footer}
    >
      <DetailLinesTable
        rows={visibleRows}
        collapsed={collapsed}
        toggleGroup={toggleGroup}
        canToggle={canToggle}
      />
    </DetailLinesCard>
  );
}
