import * as React from "react";

export function ActivityItemIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-2 rounded-lg bg-gray-100 border flex-shrink-0">
      {children}
    </div>
  );
}
