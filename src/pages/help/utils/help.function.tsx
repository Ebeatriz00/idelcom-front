import React, { useState } from "react";
import type { HelpArea, HelpAreaNode, HelpDoc } from "./help.type";

export function areaLabel(a: HelpArea) {
  switch (a) {
    case "GENERAL":
      return "GENERAL";
    case "CRM":
      return "CRM";
    case "PREVENTA":
      return "Preventa";
    case "LOGISTICA":
      return "Logística";
    case "GERENCIA":
      return "Gerencia";
    default:
      return a;
  }
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TextHighlight({ text, q }: { text: string; q: string }) {
  const query = q.trim();
  if (!query) return <>{text}</>;

  const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(re);

  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-amber-200/70 rounded px-0.5">
            {p}
          </mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}
export const AREA_ORDER: HelpArea[] = [
  "GENERAL",
  "CRM",
  "PREVENTA",
  "LOGISTICA",
  "GERENCIA",
];

export function areaRank(a: HelpArea) {
  const i = AREA_ORDER.indexOf(a);
  return i === -1 ? 999 : i;
}
export function buildTree(
  docs: HelpDoc[],
  allowedAreas: HelpArea[],
  q: string,
): HelpAreaNode[] {
  const query = q.trim().toLowerCase();
  const visible = docs.filter((d) => allowedAreas.includes(d.area));

  const filtered = !query
    ? visible
    : visible.filter((d) => {
        const inTitle = d.title.toLowerCase().includes(query);
        const inKeys = d.keywords.some((k) => k.toLowerCase().includes(query));
        const inGroup = d.group.toLowerCase().includes(query);
        const inSections = d.sections.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.body.toLowerCase().includes(query) ||
            (s.bullets ?? []).some((b) => b.toLowerCase().includes(query)),
        );
        return inTitle || inKeys || inGroup || inSections;
      });

  const byArea = new Map<HelpArea, Map<string, HelpDoc[]>>();

  for (const d of filtered) {
    if (!byArea.has(d.area)) byArea.set(d.area, new Map());
    const gmap = byArea.get(d.area)!;
    if (!gmap.has(d.group)) gmap.set(d.group, []);
    gmap.get(d.group)!.push(d);
  }

  const areas = Array.from(byArea.keys()).sort((a, b) => {
    const ra = areaRank(a);
    const rb = areaRank(b);
    if (ra !== rb) return ra - rb;

    return areaLabel(a).localeCompare(areaLabel(b));
  });

  return areas.map((area) => {
    const gmap = byArea.get(area)!;
    const groups = Array.from(gmap.entries())
      .sort(([g1], [g2]) => g1.localeCompare(g2))
      .map(([group, items]) => ({
        area,
        group,
        items: items.sort((a, b) => a.title.localeCompare(b.title)),
      }));

    return { area, groups };
  });
}
export function scrollToId(id: string, offset: number) {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return { copy, copied };
}
export function Callout({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="text-sm font-semibold text-indigo-900">{title}</div>
      <div className="mt-1 text-sm text-indigo-900/80">{body}</div>
    </div>
  );
}

export function getAllowedAreasMock(): HelpArea[] {
  // ejemplo: usuario comercial + preventa
  return ["GENERAL", "CRM", "PREVENTA"];
}
