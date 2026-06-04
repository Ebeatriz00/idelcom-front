import { Search } from "lucide-react";
import { SearchSelect } from "@/layouts";
import type { OptionItem } from "@/application";

interface AttendanceFiltersProps {
  opporId: number | undefined;
  setOpporId: (id: number | undefined) => void;
  workOrderId: number | undefined;
  setWorkOrderId: (id: number | undefined) => void;
  squadId: number | undefined;
  setSquadId: (id: number | undefined) => void;
  search: string;
  setSearch: (s: string) => void;
  projects: any[] | undefined;
  workOrders: any[] | undefined;
  squads: any[] | undefined;
}

export const AttendanceFilters = ({
  opporId,
  setOpporId,
  workOrderId,
  setWorkOrderId,
  squadId,
  setSquadId,
  search,
  setSearch,
  projects,
  workOrders,
  squads
}: AttendanceFiltersProps) => {
  const projectOptions: OptionItem[] = projects?.map(p => ({ value: p.opporId, label: p.opporDesc })) || [];
  const selectedProject = projectOptions.find(o => o.value === opporId) || null;

  const woOptions: OptionItem[] = workOrders
    ?.filter((wo: any) => !opporId || wo.opporId === opporId)
    .map(wo => ({ value: wo.workOrderId, label: `${wo.workOrderCode} - ${wo.workOrderName}` })) || [];
  const selectedWO = woOptions.find(o => o.value === workOrderId) || null;

  const squadOptions: OptionItem[] = squads
    ?.filter((s: any) => !workOrderId || s.workOrderId === workOrderId)
    .map(s => ({ value: s.squadId, label: s.squadName })) || [];
  const selectedSquad = squadOptions.find(o => o.value === squadId) || null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* Buscar trabajador */}
        <div className="space-y-2">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Buscar Trabajador</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Nombre o documento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:h-[38px] sm:text-xs"
            />
          </div>
        </div>

        {/* Proyecto */}
        <div className="space-y-2">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Proyecto</label>
          <SearchSelect
            placeholder="Seleccionar proyecto..."
            value={selectedProject}
            onChange={(opt) => {
              setOpporId(opt?.value as number);
              setWorkOrderId(undefined);
              setSquadId(undefined);
            }}
            useOptions={() => ({
              data: { items: projectOptions },
              isLoading: false,
              isFetching: false,
              hasMore: false,
              refetch: () => { }
            } as any)}
          />
        </div>

        {/* Orden de Trabajo */}
        <div className="space-y-2">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Orden de Trabajo</label>
          <SearchSelect
            placeholder="Seleccionar OT..."
            disabled={!opporId}
            value={selectedWO}
            onChange={(opt) => {
              setWorkOrderId(opt?.value as number);
              setSquadId(undefined);
            }}
            useOptions={() => ({
              data: { items: woOptions },
              isLoading: false,
              isFetching: false,
              hasMore: false,
              refetch: () => { }
            } as any)}
          />
        </div>

        {/* Cuadrilla */}
        <div className="space-y-2">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cuadrilla</label>
          <SearchSelect
            placeholder="Seleccionar cuadrilla..."
            disabled={!workOrderId}
            value={selectedSquad}
            onChange={(opt) => {
              setSquadId(opt?.value as number);
            }}
            useOptions={() => ({
              data: { items: squadOptions },
              isLoading: false,
              isFetching: false,
              hasMore: false,
              refetch: () => { }
            } as any)}
          />
        </div>
      </div>
    </div>
  );
};
