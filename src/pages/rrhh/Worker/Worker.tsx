import { boolToStatusString, showWarning, statusToBool, useWorkerMutations } from "@/sharedKernel";
import { WorkerFormModal } from "./components/WorkerFormModal";
import { useWorkerFormModal } from "./hooks/useWorkerFormModal";
import { useHrWorkerPerms } from "./hooks/worker.perms";
import { useWorkerWorkspace } from "./hooks/useWorkerWorkspace";
import { WorkerListPanel } from "./components/workspace/WorkerListPanel";
import { WorkerDetailPanel } from "./components/workspace/WorkerDetailPanel";

export default function Worker() {
  const {
    pagination, setPagination,
    search, handleSearch,
    selectedId, setSelectedId,
    listData, isLoadingList, listError,
    selectedDetail, isLoadingDetail
  } = useWorkerWorkspace();

  const { statusMut } = useWorkerMutations();
  const {
    open, isFetching, defaultValues,
    openCreate, openEdit, close, submit, saving, editingId,
  } = useWorkerFormModal();

  const {
    canCreateWorker, canEditWorker, canEditStatusWorker
  } = useHrWorkerPerms();

  const rows = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const pageCount = listData?.totalPages ?? 1;

  async function onToggleStatus(row: any) {
    if (!canEditStatusWorker) return;
    if (row.workerId == null) {
      await showWarning("No se puede cambiar el estado: el ID es inválido.");
      return;
    }
    const current = statusToBool(row.status ?? "1");
    await statusMut.mutateAsync({
      workerId: row.workerId,
      status: boolToStatusString(!current),
    });
  }

  return (
    <>
      {listError && (
        <div className="mb-4 rounded-xl border bg-white p-4 text-sm text-rose-600">
          {(listError as any)?.message ?? "Error cargando los datos."}
        </div>
      )}

      <div className="flex h-[calc(100vh-140px)] w-full bg-zinc-50 font-sans text-zinc-900 overflow-hidden rounded-xl border border-zinc-200">
        
        <WorkerListPanel 
          items={rows}
          total={total}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex}
          isLoading={isLoadingList}
          search={search}
          onSearchChange={handleSearch}
          onPageChange={(idx) => setPagination(p => ({...p, pageIndex: idx}))}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={canCreateWorker ? openCreate : undefined}
        />

        <WorkerDetailPanel 
          worker={selectedDetail}
          isLoading={isLoadingDetail}
          canEdit={canEditWorker}
          canEditStatus={canEditStatusWorker}
          onEdit={openEdit}
          onToggleStatus={onToggleStatus}
        />
        
      </div>

      <WorkerFormModal
        open={open}
        title={editingId ? "Editar Trabajador" : "Nuevo Trabajador"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues as any}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        departmentLabel={""}
        provinceLabel={""}
        districtLabel={""}
        areaLabel={""}
        jobTitleLabel={""}
      />
    </>
  );
}