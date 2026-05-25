export function EmptyRequirementsState({
  message = "No hay requisitos registrados.",
  description = "Cuando se registren requisitos de homologación, aparecerán aquí.",
}: {
  message?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <p className="text-base font-semibold text-slate-700">{message}</p>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
