export function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 py-2">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <div className="mt-0.5 text-sm text-gray-800 break-words">{value}</div>
      </div>
    </li>
  );
}
