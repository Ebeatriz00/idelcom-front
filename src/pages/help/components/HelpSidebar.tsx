import { ChevronDown, ChevronRight, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { areaLabel, buildTree, scrollToId, TextHighlight } from "../utils/help.function";
import type { HelpSidebarProps } from "../utils/help.type";

export function HelpSidebar({
  docs,
  allowedAreas,
  activeDocId,
  onSelectDocId,
  onCloseMobile,
  searchPlaceholder = "Buscar en el manual…",
}: HelpSidebarProps) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const tree = useMemo(
    () => buildTree(docs, allowedAreas, q),
    [docs, allowedAreas, q]
  );

  React.useEffect(() => {
    if (!q) {
      setOpen({}); 
      return;
    }
    const next: Record<string, boolean> = {};
    for (const a of tree) {
      for (const g of a.groups) {
        next[`${a.area}::${g.group}`] = true;
      }
    }
    setOpen(next);
  }, [tree, q]);

  const go = (docId: string) => {
    if (onSelectDocId) onSelectDocId(docId);
    else nav(`/help/${docId}`);
    onCloseMobile?.();
  };

  return (
    <aside className="w-full flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-50">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/20 focus:outline-none transition-all"
          />
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {tree.map((areaNode) => (
          <div key={areaNode.area} className="space-y-1">
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              {areaLabel(areaNode.area)}
            </div>

            {areaNode.groups.map((g, gIdx) => {
              const groupKey = `${g.area}::${g.group}`;
              const isOpen = open[groupKey] ?? false;
              const groupNum = gIdx + 1;

              return (
                <div key={groupKey} className="space-y-1">
                  <button
                    onClick={() => setOpen((s) => ({ ...s, [groupKey]: !isOpen }))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">
                      <TextHighlight text={g.group} q={q} />
                    </span>
                    <ChevronDown
                      className={`size-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-2 pl-2 border-l border-gray-100 space-y-1 mt-1">
                      {g.items.map((doc, dIdx) => {
                        const active = doc.id === activeDocId;
                        const docNum = `${groupNum}.${dIdx + 1}`;
                        
                        const itemClass = "w-full text-left flex items-start justify-between rounded-lg px-3 py-2 text-sm transition-all relative group/item";
                        const activeClass = "bg-indigo-50/50 text-indigo-700 font-medium";
                        const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

                        return (
                          <div key={doc.id} className="space-y-0.5">
                            <button
                              onClick={() => go(doc.id)}
                              className={`${itemClass} ${active ? activeClass : inactiveClass}`}
                            >
                              <div className="flex items-start gap-2">
                                {active && (
                                  <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-indigo-500 rounded-full" />
                                )}
                                <span className="shrink-0 font-mono text-[10px] mt-0.5 opacity-40 tabular-nums">
                                  {docNum}
                                </span>
                                <span className={`line-clamp-2 ${active ? "translate-x-0.5" : ""}`}>
                                  <TextHighlight text={doc.title} q={q} />
                                </span>
                              </div>
                              {!active && <ChevronRight className="size-3 text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />}
                            </button>

                            {/* Subíndices 1.1.1, 1.1.2... */}
                            {active && doc.sections && (
                              <div className="ml-4 mt-1 mb-2 space-y-0.5 border-l border-indigo-100/50">
                                {doc.sections.map((sec, sIdx) => {
                                  const secNum = `${docNum}.${sIdx + 1}`;
                                  return (
                                    <button
                                      key={sec.id}
                                      onClick={() => scrollToId(`${doc.id}__${sec.id}`, 110)}
                                      className="w-full text-left px-4 py-1.5 text-[11px] text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/30 rounded-r-lg transition-colors flex items-center gap-2 group/sub"
                                    >
                                      <span className="font-mono text-[10px] opacity-60 tabular-nums">
                                        {secNum}
                                      </span>
                                      <span className="line-clamp-1">{sec.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}