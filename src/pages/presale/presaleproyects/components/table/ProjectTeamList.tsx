import { useState } from "react";
import { useProjectTeamList, useProjectTeamMutations } from "@/sharedKernel/hooks/presale/usePreSaleProyects"; 
import { User, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react"; 
import { confirmAction, useDebouncedValue } from "@/sharedKernel"; 

export function ProjectTeamList({ 
  projectToken, 
  businessId 
}: { 
  projectToken: string; 
  businessId: number; 
}) {
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  
  const debouncedSearch = useDebouncedValue(search, 500); 

  const { data, isLoading } = useProjectTeamList(page, pageSize, debouncedSearch, projectToken);
  
  const { deleteCollaboratorMut } = useProjectTeamMutations();

  const totalPages = data?.totalPages ?? 0;
  const items = data?.items ?? [];

  if (debouncedSearch !== "" && page > 0 && items.length === 0) {
      setPage(0);
  }

  const handleDelete = async (teamId: number, workerName: string) => {
    const ok = await confirmAction({
        title: "¿Eliminar colaborador?",
        text: `¿Seguro que deseas quitar a ${workerName} del equipo?`,
        confirmText: "Sí, eliminar",
        icon: "warning"
    });

    if (ok) {
        await deleteCollaboratorMut.mutateAsync({
            projectTeamId: teamId,
            businessId: businessId
        });
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          Equipo Actual ({data?.total ?? 0})
        </h4>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(0); 
            }}
            placeholder="Buscar en el equipo..."
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <Search className="size-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {isLoading ? (
         <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
            {search ? "No se encontraron resultados." : "No hay colaboradores asignados."}
        </p>
      ) : (
        <div className="rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Colaborador</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Cargo
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-16">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((member: any) => (
                <tr key={member.projectTeamId}>
                  <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                    <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      <User className="size-3.5" />
                    </div>
                    <span title={member.workerName} className="truncate max-w-[200px]">
                        {member.workerName}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[120px]" title={member.jobTitle}>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {member.jobTitle || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(member.projectTeamId, member.workerName)}
                      disabled={deleteCollaboratorMut.isPending}
                      // CAMBIO AQUÍ: 'text-red-600' en lugar de 'text-gray-400 hover:text-red-600'
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar del equipo"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50">
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs text-gray-500">Pag {page + 1} de {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}