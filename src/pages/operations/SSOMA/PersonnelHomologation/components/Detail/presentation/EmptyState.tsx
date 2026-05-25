export function EmptyState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Selecciona un colaborador
        </h2>
        <p className="text-sm text-slate-500">
          El detalle de homologacion aparecera aqui cuando elijas un registro
          del panel izquierdo.
        </p>
      </div>
    </div>
  );
}