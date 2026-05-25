import type { ProjectsUpdateStatusDto } from "@/application/dtos/presale/PreSaleProyects.dto";
import { Modal } from "@/layouts";
import { ProjectChangeStateForm, type ProjectFileUploaded } from "./ProjectChangeStateForm";

type Props = {
  open: boolean;
  defaultValues: Partial<ProjectsUpdateStatusDto>;
  onClose: () => void;
  onSubmit: (dto: ProjectsUpdateStatusDto, files?: ProjectFileUploaded[]) => void;
  saving: boolean;
  loadingDetail?: boolean;
  currentStateLabel?: string;
  pendingCount?: number;
  opporNumber?: string;
};

export function ProjectChangeStateFormModal({
  open,
  defaultValues,
  onClose,
  onSubmit,
  saving,
  loadingDetail,
  currentStateLabel,
  pendingCount = 0,
  opporNumber = "" 
}: Props) {
  if (!open) return null;

  return (
    <Modal
      title="Cambiar Estado del Proyecto"
      size="full" 
      onClose={onClose}
    >
      <div className="p-4">
        {loadingDetail ? (
          <div className="py-8 text-center text-sm text-gray-500">Cargando información...</div>
        ) : (
          <ProjectChangeStateForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
            onCancel={onClose}
            currentStateLabel={currentStateLabel}
            pendingCount={pendingCount}
            opporNumber={opporNumber} 
          />
        )}
      </div>
    </Modal>
  );
}