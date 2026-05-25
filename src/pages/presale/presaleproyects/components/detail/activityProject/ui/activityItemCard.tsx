import * as React from "react";

export function ActivityItemCard({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50"
    >
      {children}
    </div>
  );
}