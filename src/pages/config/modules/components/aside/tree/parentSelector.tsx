import { useEffect, useMemo, useState } from "react";
import { X, Folder, ChevronDown, ChevronRight, Search } from "lucide-react";

// === Tipos esperados ===
export type TreeNode = {
  id: number;
  label: string;
  icon?: string | null;
  path?: string | null;     // null/"" => carpeta
  status?: string;
  orderNo: number;
  parentId?: number | null;
  children: TreeNode[];
};
export type ParentRef = { id: number | null | null; label?: string | null } | null;

export function ParentSelector({
  sectionTitle,
  tree,
  currentParent,
  onPick,
  allowPickByCode = true,
}: {
  sectionTitle: string;
  tree: TreeNode[];
  currentParent: ParentRef;
  onPick: (parent: ParentRef | { code: string; by: "code" }) => void;
  allowPickByCode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"arbol" | "buscar" | "code">("arbol");
  const [display, setDisplay] = useState("Raíz de la sección");

  useEffect(() => {
    if (currentParent?.label) setDisplay(currentParent.label);
    else setDisplay("Raíz de la sección");
  }, [currentParent]);

  // Helpers
  const isFolder = (n: TreeNode) =>
    !n.path || n.path.trim() === "" || (n.children?.length ?? 0) > 0;

  const flat = useMemo(() => flattenTree(tree).filter(isFolder), [tree]);
  const [search, setSearch] = useState("");
  const searchMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flat;
    return flat.filter((n) => n.label.toLowerCase().includes(q));
  }, [flat, search]);

  const [code, setCode] = useState("");

  return (
    <div>
      {/* ÚNICO INPUT (abre el modal) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm hover:bg-white focus:bg-white focus:ring-2 focus:ring-gray-300"
        aria-label="Seleccionar carpeta padre"
      >
        {display}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h4 className="font-semibold text-gray-900">Seleccionar carpeta padre</h4>
                <p className="text-xs text-gray-500">{sectionTitle}</p>
              </div>
              <button className="p-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3">
              <div className="flex gap-2 text-sm">
                <TabBtn active={tab==="arbol"} onClick={()=>setTab("arbol")}>Árbol</TabBtn>
                <TabBtn active={tab==="buscar"} onClick={()=>setTab("buscar")}>Buscar</TabBtn>
                {allowPickByCode && (
                  <TabBtn active={tab==="code"} onClick={()=>setTab("code")}>Por CODE</TabBtn>
                )}
              </div>
            </div>

            <div className="p-4">
              {/* TAB: Árbol (solo carpetas) */}
              {tab === "arbol" && (
                tree?.length ? (
                  <TreeOnlyFolders
                    nodes={tree}
                    isFolder={isFolder}
                    onPick={(n) => {
                      onPick({ id: n.id, label: n.label });
                      setOpen(false);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No hay carpetas en esta sección.</p>
                )
              )}

              {/* TAB: Buscar (solo carpetas) */}
              {tab === "buscar" && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar carpeta…"
                      className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm"
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="max-h-[420px] overflow-auto border rounded-xl divide-y">
                    {searchMatch.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3">Sin coincidencias.</p>
                    ) : (
                      searchMatch.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onPick({ id: m.id, label: m.label });
                            setOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Folder className="w-4 h-4" />
                          <span>{m.label}</span>
                          <span className="ml-auto text-[10px] text-gray-400">ID: {m.id}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Por CODE (opcional) */}
              {tab === "code" && allowPickByCode && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-600">
                    CODE del padre (slug estable)
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. SEG_CONF_GENERAL"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Si no ubicas la carpeta en el árbol, puedes indicar su CODE (el backend resolverá el ID).
                  </p>
                  <div className="flex justify-end">
                    <button
                      className="rounded-xl bg-gray-900 text-white px-3 py-2 text-sm hover:bg-black"
                      onClick={() => {
                        if (!code.trim()) return;
                        onPick({ code: code.trim(), by: "code" });
                        setOpen(false);
                      }}
                    >
                      Usar CODE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ——— helpers UI ———
function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 ${active ? "bg-gray-900 text-white" : "border hover:bg-gray-50"}`}
    >
      {children}
    </button>
  );
}

function TreeOnlyFolders({
  nodes,
  isFolder,
  onPick,
}: {
  nodes: TreeNode[];
  isFolder: (n: TreeNode) => boolean;
  onPick: (n: TreeNode) => void;
}) {
  return (
    <div className="max-h-[420px] overflow-auto">
      {nodes.map((n) => (
        <FolderNode key={n.id} node={n} isFolder={isFolder} onPick={onPick} />
      ))}
    </div>
  );
}

function FolderNode({
  node,
  isFolder,
  onPick,
}: {
  node: TreeNode;
  isFolder: (n: TreeNode) => boolean;
  onPick: (n: TreeNode) => void;
}) {
  const [open, setOpen] = useState(true);
  const childrenFolders = (node.children || []).filter(isFolder);
  const hasChildren = childrenFolders.length > 0;
  const selectable = isFolder(node);

  return (
    <div className="select-none">
      <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
        <button
          className="flex items-center gap-1 text-gray-700"
          onClick={() => (hasChildren ? setOpen((v) => !v) : selectable ? onPick(node) : null)}
        >
          {hasChildren ? (open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4" />}
          <span className="w-4 h-4 flex items-center justify-center">
            <Folder className="w-4 h-4" />
          </span>
          <span className="truncate" onClick={() => selectable && onPick(node)}>{node.label}</span>
        </button>
      </div>

      {open && hasChildren && (
        <div className="ml-5 border-l pl-3">
          {childrenFolders.map((c) => (
            <FolderNode key={c.id} node={c} isFolder={isFolder} onPick={onPick} />
          ))}
        </div>
      )}
    </div>
  );
}

function flattenTree(nodes: TreeNode[], trail: { id: number; label: string }[] = []): TreeNode[] {
  const out: TreeNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flattenTree(n.children, [...trail, { id: n.id, label: n.label }]));
  }
  return out;
}
