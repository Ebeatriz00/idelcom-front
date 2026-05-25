export function SectionTitle({
  icon: Icon,
  title,
  right,
}: {
  icon?: any;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {Icon ? (
          <div className="mt-0.5 rounded-xl bg-zinc-100 p-2 text-zinc-700">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
        </div>
      </div>
      {right}
    </div>
  );
}
