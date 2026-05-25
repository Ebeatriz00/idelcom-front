import { useState } from "react";
import { TextHighlight } from "../utils/help.function";
import type { HelpFaqProps } from "../utils/help.type";

export function HelpFaq({
  faqs = [],
  query = "",
  allowMultiple = false,
}: HelpFaqProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  if (!faqs.length) return null;

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);

      if (allowMultiple) {
        return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      }

      return isOpen ? [] : [id];
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-semibold text-gray-900">
        Preguntas frecuentes
      </div>

      <div className="mt-4 space-y-2">
        {faqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);

          return (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 transition"
                aria-expanded={isOpen}
              >
                <span className="pr-4">
                  <TextHighlight text={faq.question} q={query} />
                </span>

                <span
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`px-4 transition-all duration-200 overflow-hidden ${
                  isOpen ? "max-h-96 py-3 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-sm text-gray-700 leading-6">
                  <TextHighlight text={faq.answer} q={query} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}