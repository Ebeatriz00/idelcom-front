// ui/PriorityChip.tsx
export function PriorityChip({
  label,
  priorityColor,
}: {
  label?: string | null;
  priorityColor?: string | null;
}) {
  const text = (label || "Normal").trim();

  const isHex = !!priorityColor && priorityColor.startsWith("#");
  const dotStyle = isHex ? { backgroundColor: priorityColor! } : {};
  const dotClass = !isHex && priorityColor ? priorityColor : "bg-gray-300";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-[3px] text-[11px] font-medium text-gray-700"
      title={text}
    >
      <span
        className={[
          "inline-block size-2 rounded-full ring-1 ring-black/5",
          !isHex ? dotClass : "",
        ].join(" ")}
        style={dotStyle}
      />
      {text}
    </span>
  );
}
