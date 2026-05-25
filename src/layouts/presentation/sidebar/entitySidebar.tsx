import { Stat } from "@/layouts/presentation/stat";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

type StatItem = { label: string; value: string | number };

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  stats?: StatItem[];
  createLabel?: string;
  onCreate?: () => void;
  customFilters?: ReactNode;
};

export function EntitySidebar({
  icon,
  title,
  description,
  stats = [],
  createLabel,
  onCreate,
  customFilters,
}: Props) {
  return (
    <aside className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {icon} {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-gray-600">{description}</p>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={String(s.value)} />
          ))}
        </div>
      )}

      {customFilters && (
        <div className="border-t border-gray-200 pt-4">{customFilters}</div>
      )}

      {createLabel && onCreate && (
        <button
          onClick={onCreate}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black"
        >
          <Plus className="size-4" /> {createLabel}
        </button>
      )}
    </aside>
  );
}
