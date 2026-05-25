import { useMemo } from "react";

export function StatusChip({
  label,
  stateColor,
  statusProgress,
}: {
  label?: string | null;
  stateColor?: string | null;
  statusProgress?: number | null;
}) {
  const text = (label || "Pendiente").trim();
  const pct = Math.max(0, Math.min(100, statusProgress ?? 0));
  const { colorStyle, colorClass } = useMemo(() => {
    const raw = stateColor || "bg-gray-400";

    if (raw.startsWith("#")) {
      return { 
        colorStyle: { color: raw }, 
        colorClass: "" 
      };
    }

    let convertedClass = raw;
    if (raw.includes("bg-")) {
      convertedClass = raw.replace("bg-", "text-");
    }
    return { 
      colorStyle: undefined, 
      colorClass: convertedClass 
    };
  }, [stateColor]);

  const R = 5, C = 2 * Math.PI * R;
  const dash = C, offset = C * (1 - pct / 100);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-[3px] text-[11px] font-medium text-gray-700 shadow-sm"
      title={`${text} (${pct}%)`}
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 14 14" 
        className={colorClass} 
        style={colorStyle}
      >
        <circle cx="7" cy="7" r={R} className="text-gray-200 stroke-current" strokeWidth="2" fill="none" />
        <circle
          cx="7"
          cy="7"
          r={R}
          className="stroke-current"
          strokeWidth="2"
          fill={pct === 100 ? "currentColor" : "none"}
          strokeDasharray={dash}
          strokeDashoffset={pct === 0 ? dash : offset}
          strokeLinecap="round"
          transform="rotate(-90 7 7)"
        />
      </svg>
      {text}
    </span>
  );
}