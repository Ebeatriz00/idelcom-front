// ActivityOpportunity.tsx
import type {
  ActivityOpporCreateDto,
} from "@/application";
import { CardContentDetail } from "@/layouts";
import { useMemo, useState } from "react";

import { useActivityState, usePriorityState } from "@/sharedKernel";


import { Filters } from "./components/activityFilters";
import { Header } from "./components/activityHeader";
import { List } from "./components/activityList";

import { useFilteredActivities } from "./hooks/useFilteredActivities";
import type { RangeQuick } from "./utils/normalize";
import { useActivityFormModal } from "../hooks/useActivityFormModal";
import { Pagination } from "./components/activityPagination";
import { ActivityFormModal } from "../modal/ActivityFormModal";
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import { useParams } from "react-router-dom";
import { usePreSaleProyectsPerms } from "../../../hooks/project.perms";

type Props = { data: PreSaleProyectsDetailDto };
const PAGE_SIZE = 5;

export default function ActivityOpportunity({ data }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { data: priorityOptions = [] } = usePriorityState();
  const { data: stateOptions = [] } = useActivityState();

  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [range, setRange] = useState<RangeQuick>("todas");
  const [page, setPage] = useState(1);
  const resetToFirst = () => setPage(1);
  const { proyectId } = useParams();

  const rows = useMemo(
    () => (Array.isArray(data?.activityList) ? data.activityList : []),
    [data?.activityList]
  );

  const filtered = useFilteredActivities(rows, { q, type, state, range });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setQ("");
    setType("");
    setState("");
    setRange("todas");
    resetPage();
  };

  const {
    open: isModalOpen,
    defaultValues,
    openCreate,
    close,
    submit,
    saving,
  } = useActivityFormModal();

  async function handleSubmit(dto: ActivityOpporCreateDto) {
    if (!proyectId) {
      return;
    }
    await submit({ ...dto, projectToken: String(proyectId) });
  }

  const { canAddActivityProject } = usePreSaleProyectsPerms();

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />

        <Header
          count={filtered.length}
          open={expanded}
          onToggle={() => setExpanded((v) => !v)}
          onAdd={canAddActivityProject ? openCreate : undefined}
        />

        <div
          id="panel-activities"
          className={`transition-all duration-300 ${
            expanded
              ? "max-h-[2400px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          } overflow-hidden`}
        >
          <Filters
            q={q}
            type={type}
            state={state}
            setState={setState}
            stateOptions={stateOptions}
            setPriority={setType}
            priorityOptions={priorityOptions}
            range={range}
            onChange={(patch) => {
              if (patch.q !== undefined) setQ(patch.q);
              if (patch.type !== undefined) setType(patch.type);
              
              if (patch.state !== undefined) setState(patch.state);
              if (patch.range !== undefined) setRange(patch.range);
              resetPage();
            }}
            onClear={clearFilters}
            onAnyChange={resetToFirst}
          />

          <List 
            items={pageItems as any} 
            onAdd={canAddActivityProject ? openCreate : undefined} 
          />

          <Pagination
            current={currentPage}
            totalPages={totalPages}
            pageCountCurrent={pageItems.length}
            pageCountTotal={filtered.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>

      {/* 🔹 Usa el alias isModalOpen */}
      <ActivityFormModal
        open={isModalOpen}
        title="Nueva actividad"
        defaultValues={{ ...defaultValues, projectToken: String(proyectId) }}
        onClose={close}
        onSubmit={handleSubmit}
        saving={saving}
        workerSenderLabel=""
        activityStateLabel=""
        activityTypeLabel=""
        activityPriorityLabel=""
      />
    </CardContentDetail>
  );
}
