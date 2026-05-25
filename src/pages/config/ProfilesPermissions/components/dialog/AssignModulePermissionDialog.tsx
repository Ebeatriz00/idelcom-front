import { Button } from "@/layouts/components/ui/button";
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useDebouncedValue } from "@/sharedKernel";
import { useModulesPermissionsList } from "@/sharedKernel/hooks/modulesPermissions/useModulesPermissions";
import { Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "./checkBox";

type Any = any;
type Row = {
  id: number | null;
  moduleName: string;
  permissionName: string;
  key: string;
};

export function AssignModulePermissionModal({
  open,
  onClose,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  profilesId: number;
  onAssign: (modulesPermissionsIds: number[]) => Promise<void> | void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isFetching } = useModulesPermissionsList(
    pageIndex,
    pageSize,
    debouncedSearch
  );

  const items: Any[] = data?.items ?? [];

  const flatRows: Row[] = useMemo(() => {
    return (items ?? []).flatMap((m: Any, mIdx: number) => {
      const moduleName = m.modulesName ?? m.moduleName ?? "-";
      const list: Any[] = m.listModulesPermissions ?? [];

      return list.map((p: Any, pIdx: number) => {
        const rawChildId = Number(p.modulesPermissionsId);
        const hasValidId = Number.isFinite(rawChildId) && rawChildId > 0;
        return {
          id: hasValidId ? rawChildId : null,
          moduleName,
          permissionName: p.permissionsName ?? p.permissionName ?? "-",
          key: `row-${mIdx}-${pIdx}-${
            hasValidId ? rawChildId : `perm-${p.permissionsId ?? pIdx}`
          }`,
        } as Row;
      });
    });
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return flatRows;
    return flatRows.filter((r) =>
      `${r.moduleName} ${r.permissionName}`.toLowerCase().includes(term)
    );
  }, [flatRows, search]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPageIndex(0);
      setSelectedIds([]);
    }
  }, [open]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  return !open ? null : (
    <Modal
      title="Asignar Módulo-Permiso"
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={selectedIds.length === 0}
            onClick={async () => {
              if (selectedIds.length === 0) return;
              await onAssign(selectedIds);
              onClose();
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Asignar ({selectedIds.length})
          </Button>
        </>
      }
    >
      {/* Buscador */}
      <div className="relative mb-3">
        <input
          placeholder="Buscar módulo"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="pl-9 w-full h-9 rounded-md border border-gray-200 px-3 text-sm"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Lista */}
      <div className="border rounded-md max-h-[52vh] overflow-auto">
        {isFetching ? (
          <div className="p-3 text-sm text-gray-500">
            <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
            Cargando...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 w-10">Sel</th>
                <th className="text-left px-3 py-2">Módulo</th>
                <th className="text-left px-3 py-2">Permiso</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const checked =
                  r.id != null ? selectedIds.includes(r.id) : false;

                return (
                  <tr key={r.key} className="border-t">
                    <td className="px-3 py-2 align-middle">
                      <Checkbox
                        checked={checked}
                        disabled={r.id == null}
                        onCheckedChange={(value) => {
                          if (r.id == null) return;
                          handleCheckboxChange(r.id, value as boolean);
                        }}
                        ariaLabel={`Seleccionar ${r.moduleName} - ${r.permissionName}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{r.moduleName}</td>
                    <td className="px-3 py-2">{r.permissionName}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    {search
                      ? "No se encontraron resultados"
                      : "No hay datos disponibles"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación simple */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>Total: {totalItems}</span>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex <= 0}
          >
            Anterior
          </Button>
          <span>
            Pág {pageIndex + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageIndex + 1 >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Modal>
  );
}
