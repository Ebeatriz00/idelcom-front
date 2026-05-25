import { useMemo } from "react";
import { areaLabel, Callout } from "../utils/help.function";
import type {
  HelpContentProps,
  HelpFaqItem,
  SectionWithCallout,
} from "../utils/help.type";
import { HelpFaq } from "./HelpFaq";
import { HelpToc } from "./HelpToc";

export function HelpContent({
  doc,
  allDocs,
  query = "",
  scrollOffsetPx = 110,
}: HelpContentProps) {
  const relatedDocs = useMemo(() => {
    if (!doc?.related?.length) return [];
    const set = new Set(doc.related);
    return allDocs.filter((d) => set.has(d.id));
  }, [doc, allDocs]);

  const faqs = (doc as any)?.faqs as HelpFaqItem[] | undefined;

  if (!doc) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">
            Selecciona un artículo del menú para ver el contenido.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {areaLabel(doc.area)} <span className="mx-1 text-gray-300">/</span>
          {doc.group} <span className="mx-1 text-gray-300">/</span>
          <span className="text-gray-500">{doc.title}</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <aside className="xl:w-[320px] shrink-0">
          <div className="sticky top-0">
            <HelpToc doc={doc} query={query} scrollOffsetPx={scrollOffsetPx} />
          </div>
        </aside>

        <section className="flex-1 min-w-0 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
            <div className="border-b border-gray-50 bg-gray-50/30 p-6">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {doc.title}
              </h1>
              <div className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                {areaLabel(doc.area)} · {doc.group}
              </div>
            </div>

            <div className="p-6 pt-8 space-y-10">
              {(doc.sections as SectionWithCallout[]).map((sec) => (
                <section
                  key={sec.id}
                  id={`${doc.id}__${sec.id}`}
                  className="scroll-mt-28"
                >
                  <h2 className="text-base font-bold text-gray-900 mb-3">
                    {sec.title}
                  </h2>

                  <div className="text-sm text-gray-700 leading-7">
                    {sec.body}
                  </div>

                  {sec.bullets?.length ? (
                    <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-2">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="pl-1">{b}</li>
                      ))}
                    </ul>
                  ) : null}

                  {sec.callout ? (
                    <div className="mt-6">
                      <Callout
                        title={sec.callout.title}
                        body={sec.callout.body}
                      />
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </div>

          <HelpFaq faqs={faqs} query={query} />

          {relatedDocs.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Artículos Relacionados
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedDocs.map((d) => (
                  <a
                    key={d.id}
                    href={`/help/${d.id}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all"
                  >
                    {d.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}