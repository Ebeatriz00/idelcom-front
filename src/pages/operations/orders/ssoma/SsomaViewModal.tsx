import { Modal } from "@/layouts";

type Props = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  names: string[];
  opporNum?: string;
};

export function SsomaViewModal({ open, onClose, onEdit, names, opporNum }: Props) {
  if (!open) return null;

  return (
    <Modal
      title={`Detalle SSOMA - Orden N° ${opporNum ?? ""}`}
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex justify-between items-center w-full">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modificar equipo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Especialistas Asignados</h4>
          <p className="text-xs text-gray-500 mt-1">
            Personal responsable de seguridad y salud en el trabajo para esta operación.
          </p>
        </div>

        {names.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {names.map((name, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 shadow-sm rounded-xl"
              >
                <div className="size-10 flex-shrink-0 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm uppercase ring-1 ring-blue-100">
                  {name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="size-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Sin equipo SSOMA</span>
            <span className="text-xs text-gray-500 mt-1 text-center">Esta operación está marcada como "No requiere SSOMA".</span>
          </div>
        )}
      </div>
    </Modal>
  );
}