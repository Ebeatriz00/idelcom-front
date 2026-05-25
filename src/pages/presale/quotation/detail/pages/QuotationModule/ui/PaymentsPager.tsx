import { cn } from "@/sharedKernel";

type Props = {
  safePage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  setPage: (updater: number | ((p: number) => number)) => void;
};

export function PaymentsPager({
  safePage,
  totalPages,
  totalRows,
  pageSize,
  setPage,
}: Props) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
      <div>
        Mostrando{" "}
        <span className="font-medium text-zinc-900">
          {(safePage - 1) * pageSize + 1}
        </span>{" "}
        –{" "}
        <span className="font-medium text-zinc-900">
          {Math.min(safePage * pageSize, totalRows)}
        </span>{" "}
        de{" "}
        <span className="font-medium text-zinc-900">{totalRows}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage(1)}
          disabled={safePage === 1}
          className={cn(
            "rounded-lg border px-2 py-1",
            safePage === 1
              ? "cursor-not-allowed border-zinc-200 text-zinc-400"
              : "border-zinc-200 hover:bg-zinc-50"
          )}
        >
          {"<<"}
        </button>

        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className={cn(
            "rounded-lg border px-2 py-1",
            safePage === 1
              ? "cursor-not-allowed border-zinc-200 text-zinc-400"
              : "border-zinc-200 hover:bg-zinc-50"
          )}
        >
          {"<"}
        </button>

        <span className="px-2">
          Página <span className="font-semibold text-zinc-900">{safePage}</span> /{" "}
          <span className="font-semibold text-zinc-900">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className={cn(
            "rounded-lg border px-2 py-1",
            safePage === totalPages
              ? "cursor-not-allowed border-zinc-200 text-zinc-400"
              : "border-zinc-200 hover:bg-zinc-50"
          )}
        >
          {">"}
        </button>

        <button
          type="button"
          onClick={() => setPage(totalPages)}
          disabled={safePage === totalPages}
          className={cn(
            "rounded-lg border px-2 py-1",
            safePage === totalPages
              ? "cursor-not-allowed border-zinc-200 text-zinc-400"
              : "border-zinc-200 hover:bg-zinc-50"
          )}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
