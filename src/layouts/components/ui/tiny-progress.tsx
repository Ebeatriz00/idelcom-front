import type { ReactNode } from "react";
import { cn } from "@shared/lib/cn";

export type StatusBadgeIntent = "neutral" | "warning" | "success" | "danger";

const intentClass: Record<StatusBadgeIntent, string> = {
  neutral: "bg-gray-100 text-gray-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger:  "bg-rose-100 text-rose-700",
};

export function StatusBadge({
  children,
  intent = "neutral",
  className,
}: {
  children: ReactNode;
  intent?: StatusBadgeIntent;
  className?: string;
}) {
  return (
    <span
      className={cn?.(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        intentClass[intent],
        className
      ) ?? `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${intentClass[intent]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
