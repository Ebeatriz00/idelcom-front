import type { ParentModulesUpsertDto } from "@/application";
import { Modal, useModalHistoryLock } from "@/layouts";
import { ParentModulesForm } from "./ParentModules";

type Props = {
  open: boolean;
  title: string;
  loadingDetail: boolean;
  defaultValues?: Partial<ParentModulesUpsertDto>;
  onClose: () => void;

  onSubmit: (dto: ParentModulesUpsertDto) => Promise<void>;
  saving: boolean;
};

function normalizeDefaults(
  v?: Partial<ParentModulesUpsertDto>
): ParentModulesUpsertDto {
  return {
    parentModulesId: v?.parentModulesId,
    businessId: v?.businessId,
    code: v?.code ?? "",
    title: v?.title ?? "",
    stickyBottom: v?.stickyBottom ?? true,
    orderNo: Number(v?.orderNo ?? 0),
    usersBy: v?.usersBy,
  };
}

export function ParentModulesFormModal({
  open,
  title,
  loadingDetail,
  defaultValues,
  onClose,
  onSubmit,
  saving,
}: Props) {
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "parent-modules-form";
  const normalizedDefaults = normalizeDefaults(defaultValues);

  return (
    <Modal
      title={title}
      subtitle="Crea o edita un módulo padre"
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="p-2 text-sm">Cargando detalle…</div>
      ) : (
        <ParentModulesForm
          key={defaultValues?.parentModulesId ?? "new"}
          defaultValues={normalizedDefaults}
          onSubmit={onSubmit}
          saving={saving}
          formId={formId}
          showActions={false}
        />
      )}
    </Modal>
  );
}
