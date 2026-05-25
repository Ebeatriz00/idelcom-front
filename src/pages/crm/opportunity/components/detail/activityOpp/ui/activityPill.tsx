import * as React from "react";
import clsx from "clsx";

type PillProps = {
  label: string;
  color?: string;
  tone?: "solid" | "soft";
  title?: string;
};

function hexToRGBA(hex: string, alpha = 1) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ActivityPill({ label, color = "#9CA3AF", tone = "soft", title }: PillProps) {
  const style: React.CSSProperties = {};
  let classes =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5 border";

  if (color.startsWith("bg-")) {
    const bgClass = color;
    const opacityClass = tone === "soft" ? "bg-opacity-20" : "";
    classes = clsx(
      classes,
      bgClass,
      opacityClass,
      tone === "solid"
        ? "text-white border-transparent"
        : "text-gray-800 border border-gray-300/50"
    );
  }
  else if (color.startsWith("#")) {
    const bg = tone === "solid" ? color : hexToRGBA(color, 0.12);
    const fg = tone === "solid" ? "#fff" : "#111827";
    const border = tone === "solid" ? color : hexToRGBA(color, 0.3);
    Object.assign(style, {
      backgroundColor: bg,
      color: fg,
      borderColor: border,
    });
  }

  return (
    <span className={classes} style={style} title={title ?? label}>
      {label}
    </span>
  );
}
