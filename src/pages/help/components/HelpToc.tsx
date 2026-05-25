import { useEffect, useMemo, useState } from "react";
import { scrollToId, TextHighlight } from "../utils/help.function";
import type { HelpTocProps } from "../utils/help.type";

export function HelpToc({
  doc,
  query = "",
  scrollOffsetPx = 110,
  className = "",
}: HelpTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!doc) return [];
    return doc.sections.map((s) => ({
      id: s.id,
      title: s.title,
      anchorId: `${doc.id}__${s.id}`,
    }));
  }, [doc]);

  useEffect(() => {
    if (!doc) return;

    const anchors = items
      .map((it) => document.getElementById(it.anchorId))
      .filter(Boolean) as HTMLElement[];

    if (!anchors.length) return;
    const rootEl = document.getElementById("helpContentScroll");
    
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActiveId((visible.target as HTMLElement).id);
      },
      {
        root: rootEl,
        rootMargin: `-${scrollOffsetPx}px 0px -70% 0px`,
        threshold: [0.05, 0.1, 0.2, 0.5],
      },
    );

    anchors.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, [doc, items, scrollOffsetPx]);

  if (!doc) {
    return (
      <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          En esta guía
        </div>
        <div className="text-sm text-gray-500">Selecciona un artículo.</div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        Contenido de la guía
      </div>

      <div className="space-y-1">
        {items.map((it) => {
          const isActive = activeId === it.anchorId;

          return (
            <button
              key={it.anchorId}
              onClick={() => scrollToId(it.anchorId, scrollOffsetPx)}
              className={[
                "w-full text-left rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-50/50 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
              aria-current={isActive ? "true" : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-full" />
              )}
              
              <span className={isActive ? "translate-x-1 inline-block transition-transform" : "transition-transform"}>
                <TextHighlight text={it.title} q={query} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}