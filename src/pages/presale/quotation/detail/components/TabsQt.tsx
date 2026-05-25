import { cn } from "@/sharedKernel";

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: Array<{ id: string; label: string; icon?: any }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => {
        const Icon = t.icon;
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
              active
                ? "border-zinc-300 bg-white shadow-sm"
                : "border-zinc-200 bg-zinc-50 hover:bg-white"
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
