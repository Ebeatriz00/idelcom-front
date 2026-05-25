type EmptyStateProps = {
  message?: string;
};

export function EmptyState({
  message = "Sin resultados para mostrar.",
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
      {message}
    </div>
  );
}
