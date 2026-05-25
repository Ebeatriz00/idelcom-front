import { AlertCircle } from "lucide-react";

export function FieldMessage({
  error,
  description,
}: {
  error?: string;
  description?: string;
}) {
  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
        <AlertCircle className="size-3.5 shrink-0" />
        {error}
      </p>
    );
  }

  if (!description) return null;

  return (
    <p className="text-[11px] leading-relaxed text-slate-500">
      {description}
    </p>
  );
}

