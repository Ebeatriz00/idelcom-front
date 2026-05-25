import { useState } from "react";

import type { ProfilesResposeDto } from "@/application/dtos/configurations/Profiles/PorfilesResponse.dto";

import {
  useProfileMutations,
  useProfilesList,
} from "@/sharedKernel/hooks/profiles/useProfilesList";

import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";

import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import { ProfileFormModal } from "./components/ProfileFormModal";
import { ProfilesTable } from "./components/table/ProfilesTable";
import { useProfileFormModal } from "./hooks/useProfileFormModal";

export default function Profiles() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useProfilesList(
    debouncedSearch,
    pagination.pageIndex,
    pagination.pageSize
  );

  const rows: ProfilesResposeDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useProfileMutations();

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  } = useProfileFormModal();

  function onEdit(row: ProfilesResposeDto) {
    if (row.profilesId) openEdit(row.profilesId);
  }

  async function onToggleStatus(row: ProfilesResposeDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      profilesId: row.profilesId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ProfilesResposeDto) {
    // TODO: confirmar + soft-delete
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error"}
          </div>
        )}

        {/* Breadcrumb genérico */}
        <Breadcrumb
          items={[
            { label: "Sitemas", href: "#" },
            { label: "Perfiles", current: true },
          ]}
          createLabel="Nuevo perfil"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ProfilesTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
          />
        </AsyncState>
      </section>

      <ProfileFormModal
        open={open}
        title={editingId ? "Editar perfil" : "Nuevo perfil"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
