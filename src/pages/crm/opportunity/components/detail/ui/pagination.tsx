import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pager({
  page,
  pageCount,
  total,
  showingFrom,
  showingTo,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  total: number;
  showingFrom: number;
  showingTo: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-600">
        Mostrando <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> de{" "}
        <strong>{total}</strong>
      </p>
      <div className="inline-flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
