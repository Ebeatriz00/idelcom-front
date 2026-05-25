import type { SuppliersUpsertDto } from "@/application";
import { Modal } from "@/layouts/components/ui/modal/Modal";
import { useModalHistoryLock } from "@/layouts/components/ui/modal/useModalHistoryLock";
import { Building2, CheckCircle2, Loader2, Save, X } from "lucide-react";

import { SuppliersForm } from "./SuppliersForm";

type SuppliersModalDefaultValues = Partial<
  SuppliersUpsertDto & {
    departmentLabel?: string;
    provinceLabel?: string;
    districtLabel?: string;
    typeSuppliersLabel?: string;
    suppliersGroupsLabel?: string;
    documentTypeLabel?: string;
    paymentTypeLabel?: string;
    paymentMethodLabel?: string;
    suppliersGroupsDescription?: string;
    documentTypeDescription?: string;
    paymentTypeDescription?: string;
    paymentMethodDescription?: string;
  }
>;

type Props = {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: SuppliersModalDefaultValues;
  onClose: () => void;
  onSubmit: (dto: SuppliersUpsertDto) => Promise<void> | void;
  saving?: boolean;
  departmentLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  typeSuppliersLabel?: string;
  suppliersGroupsLabel?: string;
  documentTypeLabel?: string;
  paymentTypeLabel?: string;
  paymentMethodLabel?: string;
};

export function SuppliersFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  departmentLabel,
  provinceLabel,
  districtLabel,
  typeSuppliersLabel,
  suppliersGroupsLabel,
  documentTypeLabel,
  paymentTypeLabel,
  paymentMethodLabel,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "suppliers-form";

  return (
    <Modal
      title={
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-secondary p-2 text-white">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span>{title}</span>
              <span className="rounded-full bg-primary-degrad px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                Compras
              </span>
            </div>
            <p className="mt-1 text-sm font-normal text-gray-500">
              Registro maestro para compras, cuentas por pagar y homologacion de proveedores.
            </p>
          </div>
        </div>
      }
      size="full"
      onClose={onClose}
      contentClassName="flex h-[90vh] max-h-[90vh] min-h-0 flex-col overflow-hidden"
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-secondary/10 bg-background px-5 py-4"
      bodyClassName="flex flex-1 min-h-0 overflow-hidden bg-background p-0"
      footerClassName="z-10 flex h-[72px] shrink-0 items-center justify-end gap-2 overflow-hidden border-t border-secondary/10 bg-background px-5 py-3"
      footer={
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
              {saving ? "Guardando..." : "Guardar proveedor"}
            </button>
          </div>
        </div>
      }
    >
      {loadingDetail ? (
        <div className="flex h-full min-h-0 items-center justify-center bg-gray-50 p-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <Loader2 className="mx-auto size-6 animate-spin text-gray-500" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              Cargando detalle del proveedor
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Preparando datos fiscales, comerciales y de ubicacion.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 overflow-hidden bg-background p-4 md:p-5">
          <SuppliersForm
            key={defaultValues?.suppliersId ?? "new"}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            formId={formId}
            showActions={false}
            departmentLabel={departmentLabel ?? defaultValues?.departmentLabel}
            provinceLabel={provinceLabel ?? defaultValues?.provinceLabel}
            districtLabel={districtLabel ?? defaultValues?.districtLabel}
            typeSuppliersLabel={
              typeSuppliersLabel ?? defaultValues?.typeSuppliersLabel
            }
            suppliersGroupsLabel={
              suppliersGroupsLabel ?? defaultValues?.suppliersGroupsLabel
            }
            documentTypeLabel={
              documentTypeLabel ?? defaultValues?.documentTypeLabel
            }
            paymentTypeLabel={
              paymentTypeLabel ?? defaultValues?.paymentTypeLabel
            }
            paymentMethodLabel={
              paymentMethodLabel ?? defaultValues?.paymentMethodLabel
            }
          />
        </div>
      )}
    </Modal>
  );
}
