import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  total: number;
  pageSize: number;
  page: number;
  setPage: (n: number) => void;
};

export function Pagination({ total, pageSize, page, setPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-600">
        Mostrando {(pageSafe - 1) * pageSize + 1}–
        {Math.min(pageSafe * pageSize, total)} de {total}
      </p>
      <div className="inline-flex gap-2">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, pageSafe - 1))}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
          disabled={pageSafe === 1}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-2 py-1 text-sm rounded-md ring-1 ring-gray-300 hover:bg-gray-100 ${
              i + 1 === pageSafe ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, pageSafe + 1))}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
          disabled={pageSafe === totalPages}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
