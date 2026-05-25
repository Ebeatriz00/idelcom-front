import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";

import { ViabilityTable } from "./components/table/ViabilityTable";

import type { Viability } from "@/application/dtos/crm/viability/Viability.dto";

import {
  useViabilityList,
  useViabilityMutations,
} from "@/sharedKernel/hooks/crm/viability/useViability";
import { ViabilityDecisionModal } from "./components/VIbilityDecisionModal";
import { ViabilityViewModal } from "./components/ViabilityNewModal";

export default function ViabilityPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useViabilityList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const { statusMut, decisionMut } = useViabilityMutations();

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionItem, setDecisionItem] = useState<Viability | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Viability | null>(null);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: Viability[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onView(row: Viability) {
    setViewItem(row);
    setViewOpen(true);
  }

  async function onToggleStatus(row: Viability) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      linkToken: row.linkToken,
      status: boolToStatusString(!current),
    });
  }

  function onProcessDecision(row: Viability) {
    setDecisionItem(row);
    setDecisionOpen(true);
  }

  async function onSubmitDecision(data: {
    linkToken: string;
    isApproved: boolean;
    rejectionReason?: string | null;
  }) {
    await decisionMut.mutateAsync(data);
    setDecisionOpen(false);
    setDecisionItem(null);
  }

  function onEdit(_row: Viability) {}

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error cargando datos"}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Viabilidad", current: true },
          ]}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay viabilidad pendientes."
        >
          <ViabilityTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onProcessDecision={onProcessDecision}
            onView={onView}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
          />
        </AsyncState>
      </section>

      {decisionItem && (
        <ViabilityDecisionModal
          open={decisionOpen}
          onClose={() => {
            setDecisionOpen(false);
            setDecisionItem(null);
          }}
          onSubmit={onSubmitDecision}
          linkToken={decisionItem.linkToken}
          opporNum={decisionItem.opporNum}
        />
      )}

      {viewItem && (
        <ViabilityViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setViewItem(null);
          }}
          data={viewItem}
          opporNum={viewItem.opporNum}
        />
      )}
    </div>
  );
}
