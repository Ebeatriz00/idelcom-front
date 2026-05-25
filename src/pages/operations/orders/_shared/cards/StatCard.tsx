export function StatCard({
  title,
  value,
  tone = "gray",
}: {
  title: string;
  value: string;
  tone?: "green" | "red" | "yellow" | "gray";
}) {
  const styles = {
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>

      <span
        className={`mt-3 inline-block rounded-lg px-2 py-1 text-xs font-semibold ${styles[tone]}`}
      >
        {title}
      </span>
    </div>
  );
}
