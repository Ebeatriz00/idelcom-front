import type {
  PersonnelHomologationListItemDto,
  PersonnelOperationsItem,
} from "@/application";
import { useDetailPersonnelHomologation } from "@/sharedKernel";
import { usePersonnelHomologationFormModal } from "../../hooks/usePersonnelHomologation";
import { buildPersonnelHomologationCreateDefaults } from "../../utils/helper";
import { PersonnelHomologationFormModal } from "../Modal/PersonnelHomologationFormModal";
import { HomologationFilesPanel } from "./HomologationFilesPanel";
import { DetailSkeleton } from "./presentation/DetailSkeleton";
import { EmptyState } from "./presentation/EmptyState";
import { HeaderCard } from "./presentation/HeaderCard";
import { SummaryPanel } from "./SummaryPanel";

function toValidId(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "object" && value !== null) {
      const record = value as Record<string, unknown>;
      const nestedCandidates = [
        record.workerId,
        record.WorkerId,
        record.personnelId,
        record.PersonnelId,
        record.personnelOperationsId,
        record.PersonnelOperationsId,
        record.idWorker,
        record.IdWorker,
      ];
      for (const nestedValue of nestedCandidates) {
        const parsedNested = Number(nestedValue);
        if (Number.isFinite(parsedNested) && parsedNested > 0) {
          return parsedNested;
        }
      }
    }

    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

export function SectionDetailPersonnelHomologation({
  selectedId,
  selectedPersonnel,
  selectedWorkerId,
}: {
  selectedId?: number;
  selectedPersonnel?: PersonnelHomologationListItemDto;
  selectedWorkerId?: number;
}) {
  const { data, isFetching } = useDetailPersonnelHomologation(selectedId);

  const { open, defaultValues, openCreate, close, submit, saving } =
    usePersonnelHomologationFormModal();

  const detailRecord = data as
    | (Partial<PersonnelOperationsItem> & Record<string, unknown>)
    | undefined;
  const selectedRecord = selectedPersonnel as
    | (Partial<PersonnelHomologationListItemDto> & Record<string, unknown>)
    | undefined;

  const workerId = toValidId(
    selectedWorkerId,
    selectedRecord?.workerId,
    selectedRecord?.personnelOperationsId,
    detailRecord?.workerId,
    detailRecord?.personnelOperationsId,
    detailRecord,
  );
  const personnelName =
    selectedPersonnel?.personnelFullName ??
    detailRecord?.personnelFullName ??
    "";

  const homologationScopeId = toValidId(
    selectedRecord?.homologationScopeId,
    detailRecord?.homologationScopeId,
    detailRecord?.scopeId,
  );

  if (selectedId === null || selectedId === undefined) {
    return <EmptyState />;
  }

  if (isFetching && !data) {
    return <DetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        No se pudo cargar el detalle del personal seleccionado.
      </div>
    );
  }

  async function handleOpenCreate() {
    const defaults = buildPersonnelHomologationCreateDefaults(
      homologationScopeId,
      workerId,
    );

    openCreate(defaults);
  }

  return (
    <>
      <div className="min-w-0 space-y-4">
        <HeaderCard data={data} onCreate={handleOpenCreate} />

        <section className="grid min-w-0 gap-6 xl:grid-cols-[3fr_1fr]">
          <div className="min-w-0 space-y-7">
            <HomologationFilesPanel
              generalItems={data.personnelHomologationGeneralItems}
              operationItems={data.personnelHomologationOperationsItem}
              workerName={personnelName}
              workerId={workerId}
              homologationScopeId={homologationScopeId}
            />
          </div>
          <div className="min-w-0 space-y-5">
            <SummaryPanel
              summaryItems={data.personnelHomologationSummaryItem}
            />
          </div>
        </section>
      </div>

      <PersonnelHomologationFormModal
        open={open}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
              {personnelName?.charAt(0)}
            </div>

            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {personnelName}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Nueva homologacion
              </div>
            </div>
          </div>
        }
        defaultValues={defaultValues}
        workerName={personnelName}
        workerId={workerId}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </>
  );
}
