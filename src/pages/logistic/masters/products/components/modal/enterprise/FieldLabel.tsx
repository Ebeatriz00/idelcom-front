export function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-1 text-[12px] font-semibold text-slate-700">
      {label}
      {required && (
        <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
          Req.
        </span>
      )}
    </label>
  );
}

