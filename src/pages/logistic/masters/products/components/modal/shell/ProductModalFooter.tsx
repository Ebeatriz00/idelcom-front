import { CheckCircle2, Loader2, Save, X } from "lucide-react";

type ProductModalFooterProps = {
  formId: string;
  isEditing?: boolean;
  loadingDetail?: boolean;
  saving?: boolean;
  onClose: () => void;
};

export function ProductModalFooter({
  formId,
  isEditing,
  loadingDetail,
  saving,
  onClose,
}: ProductModalFooterProps) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
        {saving ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-accent" />
        )}
        <span className="truncate">
          {saving ? "Guardando cambios..." : "Listo para validar y guardar"}
        </span>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-secondary/15 bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving}
        >
          <X className="size-4" />
          Cancelar
        </button>
        <button
          type="submit"
          form={formId}
          disabled={saving || loadingDetail}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Guardando..." : isEditing ? "Actualizar producto" : "Guardar producto"}
        </button>
      </div>
    </div>
  );
}

