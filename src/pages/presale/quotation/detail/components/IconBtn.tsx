import { cn } from "@/sharedKernel";

type Tone = "neutral" | "info" | "success" | "warn" | "danger";

export function IconBtn({
  title,
  children,
  onClick,
  tone = "neutral",
}: {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: Tone;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm active:scale-[0.99]",
        "bg-white hover:bg-zinc-50 border-zinc-200",
        tone === "danger" &&
          "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
      )}
    >
      {children}
    </button>
  );
}
