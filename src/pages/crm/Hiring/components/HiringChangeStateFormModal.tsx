import { Modal } from "@/layouts";
import { HiringChangeStateForm } from "./HiringChangeStateForm";

type ExistingFile = { fileTitle: string };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any, files?: any[]) => void;
  saving: boolean;
  defaultValues: any;
  currentStateLabel?: string;
  opporNumber: string;
  requestNote?: string;
  existingFiles?: ExistingFile[];

  preSalesId?: number | null;
  typeObsClients?: number | null; 
  affects?: number | null;
  opporStateId?: number | null;
}

export function HiringChangeStateFormModal({
  open,
  onClose,
  onSubmit,
  saving,
  defaultValues,
  currentStateLabel,
  opporNumber,
  existingFiles = [],
  requestNote,

  preSalesId,
  typeObsClients,
  affects,
  opporStateId

}: Props) {
  if (!open) return null;

  return (
    <Modal
      title="Cambiar Estado de Contratación"
      size="xl"
      onClose={onClose}
    >
      <div className="p-6">
        <HiringChangeStateForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          saving={saving}
          currentStateLabel={currentStateLabel}
          opporNumber={opporNumber}
          existingFiles={existingFiles}
          requestNote={requestNote}
          
          preSalesId={preSalesId}
          typeObsClients={typeObsClients} 
          affects={affects}
          opporStateId={opporStateId}
        />
      </div>
    </Modal>
  );
}