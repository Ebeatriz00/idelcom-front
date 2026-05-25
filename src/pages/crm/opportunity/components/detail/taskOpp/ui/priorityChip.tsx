import { Flag } from "lucide-react";
import { bgToTextClass } from "../../ui/colorMap";

export function PriorityChip({
  desc,
  color,
}: {
  desc?: string | null;   
  color?: string | null; 
}) {
  const label = (desc || "Normal").trim();
  const textColor = bgToTextClass(color);

  return (
    <span
      title={`Prioridad: ${label}`}
      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-[3px] text-[11px] font-medium text-gray-700"
    >
      <Flag
        className={`size-[11px] ${textColor}`}
        fill="currentColor"
        stroke="currentColor"
      />
      {label}
    </span>
  );
}
