// PermissionsMiniList.tsx
import { useEffect, useMemo, useState } from "react";
import { Pencil, Shield } from "lucide-react";

export type MiniPermission = {
  modulesPermissionsId: number;
  permissionsId: number;
  permissionsName: string;
};

type Props = {
  items: MiniPermission[];
  onEdit: (perm: MiniPermission) => void;
  pageSize?: number; 
};

export function PermissionsMiniList({ items, onEdit, pageSize = 10 }: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // filtra por nombre o id
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (it) =>
        it.permissionsName.toLowerCase().includes(t) ||
        String(it.permissionsId).includes(t)
    );
  }, [items, q]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const current = filtered.slice(start, end);

  // si cambia el query o el total, vuelve a página 1
  useEffect(() => { setPage(1); }, [q, items.length]);

  return (
    <div className="space-y-2">
      {/* buscador + contador */}
      <div className="flex items-center justify-between gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar permiso…"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <span className="shrink-0 text-xs text-gray-500">
          {total}/{items.length}
        </span>
      </div>

      {/* lista con scroll y altura fija */}
      <div className="max-h-[50vh] overflow-auto rounded-md border">
        {current.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-gray-500">
            {q ? "Sin resultados para la búsqueda." : "Sin permisos vinculados."}
          </div>
        ) : (
          <ul className="divide-y">
            {current.map((it) => (
              <li
                key={`${it.modulesPermissionsId}-${it.permissionsId}`}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="rounded bg-indigo-50 p-1.5 text-indigo-600">
                  <Shield className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.permissionsName}</p>
                  <p className="truncate text-xs text-gray-500">
                    ID Permiso: {it.permissionsId}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-gray-100"
                  onClick={() => onEdit(it)}
                >
                  <Pencil className="size-3.5" />
                  Editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* paginación simple */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          {total === 0 ? "0" : `${start + 1}–${end}`} de {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="px-1">
            Página {page}/{pageCount}
          </span>
          <button
            className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
