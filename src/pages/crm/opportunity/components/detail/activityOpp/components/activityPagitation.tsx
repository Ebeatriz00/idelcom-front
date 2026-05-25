// components/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

type PaginationProps = {
  current: number;
  totalPages: number;
  pageCountCurrent: number;
  pageCountTotal: number;
  onPrev: () => void;
  onNext: () => void;
};

export const Pagination = memo(function Pagination({
  current,
  totalPages,
  pageCountTotal,
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
      <p className="text-xs text-gray-600">
        Mostrando {current}-{totalPages} de <strong>{pageCountTotal}</strong>
      </p>
      <div className="inline-flex gap-2">
        <button
          type="button"
          disabled={current <= 1}
          onClick={onPrev}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={onNext}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
});
