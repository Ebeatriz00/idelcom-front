import { Modal, useModalHistoryLock } from "@/layouts";
import { ProjectCollaboratorForm, type ProjectCollaboratorBatchDto } from "./ProjectCollaboratorForm"; 
import { ProjectTeamList } from "./table/ProjectTeamList";

type Props = {
  open: boolean;
  projectToken: string | null;
  businessId: number | null; 
  onClose: () => void;
  onSubmit: (dto: ProjectCollaboratorBatchDto) => Promise<void> | void;
  saving: boolean;
};

export function ProjectCollaboratorModal({
  open,
  projectToken,
  businessId,
  onClose,
  onSubmit,
  saving,
}: Props) {
  
  useModalHistoryLock(open, onClose);
  if (!open) return null;

  const formId = "project-collaborator-form";

  const defaultValues = {
    projectToken: projectToken ?? undefined,
    businessId: businessId ?? undefined,
    workerId: undefined,
  };

  const hasLoadedData = projectToken != null && businessId != null;

  return (
    <Modal
      title="Gestión de Equipo del Proyecto" 
      subtitle="Agrega nuevos colaboradores o visualiza el equipo actual"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            Cerrar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving || !hasLoadedData} 
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Agregar Seleccionados"}
          </button>
        </>
      }
    >

      {hasLoadedData ? (
        <div className="space-y-6"> 
          
          <ProjectCollaboratorForm
            key={`${projectToken}-collaborator`} 
            formId={formId}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            saving={saving}
          />

          {projectToken && (
             <ProjectTeamList 
             projectToken={projectToken}
             businessId={businessId} />
          )}

        </div>
      ) : (
        <div className="p-4 text-sm text-gray-500">
          Cargando información del proyecto...
        </div>
      )}
    </Modal>
  );
}