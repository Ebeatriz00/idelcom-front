import { cn } from "@/sharedKernel";
import { CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

type FormHelpTone = "blue" | "amber" | "emerald";

export function FormHelp({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: FormHelpTone;
}) {
  const toneClass: Record<FormHelpTone, string> = {
    blue: "border-blue-100 bg-blue-50/70 text-blue-800",
    amber: "border-amber-100 bg-amber-50/80 text-amber-800",
    emerald: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3",
        toneClass[tone],
      )}
    >
      {tone === "emerald" ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <Info className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="text-xs font-medium leading-relaxed">{children}</div>
    </div>
  );
}
