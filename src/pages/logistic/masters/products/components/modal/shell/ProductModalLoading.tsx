import { Loader2 } from "lucide-react";

export function ProductModalLoading() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-gray-50 p-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <Loader2 className="mx-auto size-6 animate-spin text-gray-500" />
        <p className="mt-3 text-sm font-medium text-gray-700">
          Cargando detalle del producto
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Preparando clasificacion, configuracion e informacion logistica.
        </p>
      </div>
    </div>
  );
}
