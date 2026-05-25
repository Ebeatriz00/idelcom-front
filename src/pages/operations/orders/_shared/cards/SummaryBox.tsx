export function SummaryBox({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
        {badge}
      </span>
    </div>
  );
}
