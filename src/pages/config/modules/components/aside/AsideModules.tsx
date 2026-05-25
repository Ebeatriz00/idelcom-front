import {
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
  InputSea,
} from "@/layouts";
import { useModulesList } from "@/sharedKernel";
import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useState, type JSX } from "react";
import { buildTreeData, TreeView } from "./tree";
import type { TreeNode } from "./tree";

export function AsideModules({
  sectionId,
  onSelectParent,
  onTreeLoaded,
  onNodeSelect,
}: {
  sectionId: number;
  onSelectParent?: (parentId: number | null) => void;

  onTreeLoaded?: (tree: TreeNode[]) => void;
  onNodeSelect?: (node: TreeNode) => void;
}) {
  const listLabelId = useId();
  const [search, setSearch] = useState("");
  const { data, isFetching, isError } = useModulesList(sectionId, search);

  const tree = useMemo(() => buildTreeData(data ?? []), [data]);
  const roots = tree.roots;

  useEffect(() => {
    if (roots && roots.length > 0) onTreeLoaded?.(roots);
    else onTreeLoaded?.([]);
  }, [roots, onTreeLoaded]);

  let content: JSX.Element;
  if (sectionId == null) {
    content = (
      <p className="text-sm text-gray-500 p-3">Selecciona una sección.</p>
    );
  } else if (isError) {
    content = (
      <p className="text-sm text-red-600 p-3">Error al cargar módulos.</p>
    );
  } else if (isFetching && (!data || data.length === 0)) {
    content = <p className="text-sm text-gray-500 p-3">Cargando módulos…</p>;
  } else if (!data || data.length === 0 || roots.length === 0) {
    content = (
      <p className="text-sm text-gray-500 p-3">
        Sin módulos aún. Crea tu primera carpeta o ítem.
      </p>
    );
  } else {
    content = (
      <TreeView
        nodes={roots}
        onSelect={(node) => {
          onNodeSelect?.(node);
          onSelectParent?.(node.id);
        }}
      />
    );
  }

  return (
    <CardSimple>
      <CardHeader className="pb-2">
        <CardTitle id={listLabelId}>Módulos de la sección</CardTitle>

        <div className="relative mt-2">
          <InputSea
            placeholder="Buscar módulo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar módulo"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="border border-gray-200 rounded-lg max-h-[460px] overflow-auto bg-white shadow-inner-sm">
          {content}
        </div>

        <p className="text-[11px] text-gray-500 mt-2">
          Tip: selecciona una <b>carpeta</b> como padre. También podrás elegir
          por búsqueda o CODE en el formulario.
        </p>
      </CardContent>
    </CardSimple>
  );
}
