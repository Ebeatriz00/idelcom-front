import type { SsomaProcessResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import { useDebouncedValue, useSsomaProcessList } from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ProcessTable } from "./Components/table/ProcessTable";

export default function Process() {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useSsomaProcessList(
    pagination.pageIndex,
    pagination.pageSize,
    null,
    debouncedSearch,
  );

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 1 }));
  }, [debouncedSearch]);

  const rows: SsomaProcessResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  return (
    <div className="min-h-[80vh] space-y-4">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "SSOMA", href: "#" },
          { label: "Procesos", current: true },
        ]}
      />
      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
      >
        <ProcessTable
          data={rows}
          total={total}
          pageCount={pageCount}
          pagination={{
            pageIndex: pagination.pageIndex - 1,
            pageSize: pagination.pageSize,
          }}
          onPaginationChange={(updater) => {
            if (typeof updater === "function") {
              setPagination((prev) => {
                const next = updater({
                  pageIndex: prev.pageIndex - 1,
                  pageSize: prev.pageSize,
                });
                return {
                  pageIndex: next.pageIndex + 1,
                  pageSize: next.pageSize,
                };
              });
            } else {
              setPagination({
                pageIndex: updater.pageIndex + 1,
                pageSize: updater.pageSize,
              });
            }
          }}
          search={search}
          onSearchChange={setSearch}
        />
      </AsyncState>
    </div>
  );
}
