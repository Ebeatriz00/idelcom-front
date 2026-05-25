import type { MovementTypesUpsertDto } from "@/application";
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import { CheckCircle2, Loader2, PackageOpen, Save, X } from "lucide-react";
import { useState } from "react";
import { MovementTypesForm } from "./MovementTypesForm";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues: Partial<MovementTypesUpsertDto>;
  onClose: () => void;
  onSubmit: (dto: MovementTypesUpsertDto) => Promise<void>;
  saving: boolean;
  movClasLabel?: string;
  movOperLabel?: string;
  movPerLabel?: string;
  movSunatLabel?: string;
  movVisLabel?: string;
};

function MovementTypesModalTitle({ title }: { title: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
        <PackageOpen className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-slate-950">{title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            ERP logistico
          </span>
        </div>
        <p className="mt-1 max-w-2xl text-sm font-normal leading-relaxed text-slate-500">
          Define como este movimiento afectara el stock, los almacenes y la trazabilidad.
        </p>
      </div>
    </div>
  );
}

export function MovementTypesFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  movClasLabel,
  movOperLabel,
  movPerLabel,
  movSunatLabel,
  movVisLabel: _movVisLabel,
}: Props) {
  const [formValid, setFormValid] = useState(false);
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "movement-types-form";
  const isEditing = Boolean(defaultValues?.movementTypesId);

  return (
    <Modal
      title={<MovementTypesModalTitle title={title} />}
      size="full"
      onClose={onClose}
      closeOnBackdrop={false}
      contentClassName="max-w-[min(96vw,64rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-950/5"
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur"
      bodyClassName="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6"
      footerClassName="sticky bottom-0 z-10 flex min-h-[76px] shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur"
      closeButtonClassName="ml-auto rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
      footer={
        <>
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
            {saving ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            )}
            <span className="truncate">
              {saving
                ? "Guardando cambios..."
                : formValid
                  ? "Formulario listo para guardar"
                  : "Completa los campos obligatorios"}
            </span>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-4" />
              Cancelar
            </button>
            <button
              type="submit"
              form={formId}
              disabled={saving || loadingDetail || !formValid}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </>
      }
    >
      {loadingDetail ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      ) : (
        <MovementTypesForm
          key={defaultValues.movementTypesId ?? "new"}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          formId={formId}
          movClasLabel={movClasLabel}
          movOperLabel={movOperLabel}
          movPerLabel={movPerLabel}
          movSunatLabel={movSunatLabel}
          onValidityChange={setFormValid}
        />
      )}
    </Modal>
  );
}
