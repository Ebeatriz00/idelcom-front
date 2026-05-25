import type { UsersResponseDto, UsersStatusDto } from "@/application";
import { AsyncState, Breadcrumb} from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useUsersList,
  useUsersMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { PasswordChangeFormModal } from "./components/modals/PassowordChangeFormModal";
import { UsersFormModal } from "./components/modals/UsersFromModal";
import { UsersTable } from "./components/table/usersTable";
import { useUsersFormModal } from "./hooks/useUsers";

export default function Users() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useUsersList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const rows: UsersResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useUsersMutations();

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    openPwd,
    openChangePassword,
    closeChange,
    submitPasswordChange,
    changing,
    editingId,
  } = useUsersFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  function onEdit(row: UsersResponseDto) {
    if (row.usersId) openEdit(row.usersId);
  }

  function onChangeP(row: UsersResponseDto) {
    if (row.usersId) openChangePassword(row.usersId); // ← antes estabas llamando openPwd(row.usersId)
  }
  async function onToggleStatus(row: UsersStatusDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      usersId: row.usersId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: UsersResponseDto) {}
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
        <Breadcrumb
          items={[
            { label: "Sistemas", href: "#" },
            { label: "Usuarios", current: true },
          ]}
          createLabel="Nuevo Usuario"
          onCreate={openCreate}
        />

         <AsyncState
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No hay cuentas registradas."
          >
          <UsersTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onChangeP={onChangeP}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            loading={isFetching}
          />
        </AsyncState>
      </section>
      <UsersFormModal
        open={open}
        title={editingId ? "Editar usuario" : "Nuevo usuario"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
      <PasswordChangeFormModal
        open={openPwd}
        usersId={editingId ?? undefined}
        onClose={closeChange}
        onSubmit={submitPasswordChange}
        saving={changing}
      />
    </div>
  );
}
