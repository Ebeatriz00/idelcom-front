import { Copy, ExternalLink, Mail } from "lucide-react";

/* ---------- Row ---------- */
type RowProps = {
  k: string;
  v?: string | number | null;
  strong?: boolean;
  truncate?: boolean;
  mono?: boolean;
  badge?: boolean;
  pill?: "emerald" | "indigo" | "amber" | "rose" | false;
  link?: boolean;
  mailto?: boolean;
  zebra?: boolean;
  onCopy?: boolean;
};

export function KVRow({
  k,
  v,
  strong,
  truncate,
  mono,
  badge,
  pill = false,
  link,
  mailto,
  zebra,
  onCopy,
}: RowProps) {
  const value = v ?? "—";
  const isEmpty = value === "—";
  const baseText = `text-[13px] ${mono ? "font-mono" : ""} ${
    strong ? "font-semibold" : "font-medium"
  } ${isEmpty ? "text-gray-400" : "text-gray-900"}`;

  const pillClasses = pill
    ? {
        emerald:
          "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        indigo:
          "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
        amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      }[pill]
    : "";

  return (
    <div
      className={[
        "grid grid-cols-[160px,1fr] gap-x-4 items-start py-2.5 rounded-lg transition-colors",
        zebra ? "odd:bg-gray-50" : "",
        "hover:bg-gray-50/70 border-b border-gray-100 last:border-b-0",
      ].join(" ")}
    >
      <div className="text-[11px] uppercase tracking-wide text-gray-500 pt-0.5">
        {k}
      </div>

      <div className="min-w-0 flex items-center gap-2">
        {badge ? (
          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {String(value)}
          </span>
        ) : pill ? (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${pillClasses}`}
          >
            {String(value)}
          </span>
        ) : link && !isEmpty ? (
          <a
            href={mailto ? `mailto:${value}` : String(value)}
            target={mailto ? undefined : "_blank"}
            rel="noreferrer"
            className={`${baseText} underline underline-offset-4 decoration-gray-300 hover:decoration-indigo-400 ${
              truncate ? "truncate" : ""
            }`}
            title={truncate ? String(value) : undefined}
          >
            {String(value)}
          </a>
        ) : (
          <span
            className={`${baseText} ${truncate ? "truncate" : ""}`}
            title={truncate ? String(value) : undefined}
          >
            {String(value)}
          </span>
        )}

        {!isEmpty && onCopy && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(String(value))}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800"
            title="Copiar"
          >
            <Copy className="size-3.5" />
          </button>
        )}
        {link && !mailto && !isEmpty && (
          <ExternalLink className="size-3.5 text-gray-400" />
        )}
        {mailto && !isEmpty && <Mail className="size-3.5 text-gray-400" />}
      </div>
    </div>
  );
}