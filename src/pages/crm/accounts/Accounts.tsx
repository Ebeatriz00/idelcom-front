import type { ClientsResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useClientsList,
  useClientsMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { LinkContactDialog } from "../contacts/components/modal/LinkContactDialog";
import { useLinkContactDialog } from "../contacts/hooks/useLinkContactDialog";
import { ClientsFormModal } from "./components/modal/ClientsFormModal";
import { VendorFormModal } from "./components/modal/VendorFormModal";
import { ClientsTable } from "./components/table/ClientsTable";
import { AccountSellersModal } from "./components/modal/AccountSellersModal";
import { useCrmAccountsPerms } from "./hooks/permissions/accounts.perms";
import { useClientsFormModal } from "./hooks/useClientsModal";
import { useSalesChangeFormModal } from "./hooks/useSalesChangeModal";

export default function Accounts() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const [sellersModal, setSellersModal] = useState<{
    open: boolean;
    sellersRaw?: string;
  }>({ open: false, sellersRaw: "" });
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useClientsList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const linkContactDialog = useLinkContactDialog();

  const { statusMut } = useClientsMutations(linkContactDialog);

  const rows: ClientsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

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
  } = useClientsFormModal(linkContactDialog);

  const {
    openSales,
    defaultValuesSales,
    openChangeVendor,
    closeSales,
    submitChange,
    savingSales,
    editingSalesId,
  } = useSalesChangeFormModal();

  const {
    canAddContact,
    canViewHistoryAccount,
    canChangeSellerOption,
    canCreateAccount,
    canEditAccount,
    canEditStatusAccount,
    canDeleteAccount,
    canExportAccount,
  } = useCrmAccountsPerms();

  function onEdit(row: ClientsResponseDto) {
    if (!canEditAccount) return;
    if (row.clientsId) openEdit(row.clientsId);
  }

  function onChangeVendor(row: ClientsResponseDto) {
    if (!canChangeSellerOption) return;
    if (row.clientsId) openChangeVendor(row.clientsId);
  }

  async function onToggleStatus(row: ClientsResponseDto) {
    if (!canEditStatusAccount) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      clientsId: row.clientsId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete() {
    if (!canDeleteAccount) return;
  }

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Cuenta", current: true },
          ]}
          createLabel="Agregar cuenta"
          onCreate={canCreateAccount ? openCreate : undefined}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ClientsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onChangeVendor={onChangeVendor}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canChangeVendor={canChangeSellerOption}
            canEdit={canEditAccount}
            canToggleStatus={canEditStatusAccount}
            canViewHistory={canViewHistoryAccount}
            canExportAccount={canExportAccount}
            canAddContact={canAddContact}
            onShowSellers={(row) =>
              setSellersModal({
                open: true,
                sellersRaw: row.sales,
              })
            }
          />
        </AsyncState>
      </section>

      <ClientsFormModal
        open={open}
        title={editingId ? "Editar Cuenta" : "Nueva Cuenta"}
        loadingDetail={Boolean(editingId) && isFetching && !saving}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        departmentLabel={""}
        provinceLabel={""}
        districtLabel={""}
      />

      <VendorFormModal
        openSales={openSales}
        title="Cambio de vendedor"
        loadingDetail={Boolean(editingSalesId) && isFetching && !savingSales}
        defaultValues={defaultValuesSales}
        onClose={closeSales}
        onSubmit={submitChange}
        saving={savingSales}
      />

      <LinkContactDialog
        open={linkContactDialog.isOpen}
        clientsId={linkContactDialog.currentClientsId || 0}
        onClose={linkContactDialog.close}
        onSubmit={linkContactDialog.onSubmit}
        saving={linkContactDialog.saving}
      />

      <AccountSellersModal
        open={sellersModal.open}
        sellersRaw={sellersModal.sellersRaw}
        onClose={() => setSellersModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
