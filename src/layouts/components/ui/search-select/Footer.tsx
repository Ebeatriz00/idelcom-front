import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";

export function SSFooter({
  currentPage,
  hasMore,
  isFetching,
  setPage,
  refetch,
}: any) {
  return (
    <div className="flex items-center justify-between border-t bg-gray-50 px-3 py-1.5 text-[11px] text-gray-600">
      {/* Página */}
      <span className="font-medium">
        Página <span className="text-gray-900">{currentPage}</span>
      </span>

      {/* Controles */}
      <div className="flex items-center gap-1.5">
        {/* Anterior */}
        <button
          type="button"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => setPage((p: number) => Math.max(1, p - 1))}
          className="size-6 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Siguiente */}
        <button
          type="button"
          disabled={!hasMore || isFetching}
          onClick={() => setPage((p: number) => p + 1)}
          className="size-6 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => refetch()}
          className="size-6 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100"
        >
          <RefreshCcw
            className={`size-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
