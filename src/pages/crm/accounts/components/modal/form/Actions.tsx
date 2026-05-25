export function FormActions({
  disabled,
  saving,
}: {
  disabled: boolean;
  saving?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
