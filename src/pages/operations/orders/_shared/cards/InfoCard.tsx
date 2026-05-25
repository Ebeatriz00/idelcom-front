export function InfoCard({
  title,
  value,
  emptyLabel,
}: {
  title: string;
  value?: string | null;
  emptyLabel: string;
}) {
  return (
    <button
      type="button"
      className="w-full min-h-[92px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30"
    >
      <p className="text-xs font-medium text-gray-500">{title}</p>

      <p className="mt-1 text-base font-semibold text-gray-900">
        {value ? value : <span className="text-blue-600">{emptyLabel}</span>}
      </p>
    </button>
  );
}