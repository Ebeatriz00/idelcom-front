import { Modal, useModalHistoryLock } from "@/layouts";
import { ClientsHistoryForm } from "./ClientsHistoryForm"; // donde lo tengas
import { useClientsHistory } from "@/sharedKernel";

type Props = {
  openHistory: boolean;
  title: string;
  onClose: () => void;
  clientsId: number | null;
};

export function ClientsHistoryFormModal({
  openHistory,
  title,
  onClose,
  clientsId,
}: Props) {
  useModalHistoryLock(openHistory, onClose);

  const { data, isLoading, isError } = useClientsHistory(clientsId ?? undefined);

  if (!openHistory) return null;

  return (
    <Modal
      title={title}
      size="md"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
        >
          Cerrar
        </button>
      }
    >
      <div className="p-4 min-h-[30vh]">
        {isLoading && (
          <p className="text-sm text-gray-500">Cargando historial…</p>
        )}
        {isError && (
          <p className="text-sm text-red-600">
            Error al cargar el historial del cliente.
          </p>
        )}
        {data && <ClientsHistoryForm data={data} pageSize={5} />}
      </div>
    </Modal>
  );
}
