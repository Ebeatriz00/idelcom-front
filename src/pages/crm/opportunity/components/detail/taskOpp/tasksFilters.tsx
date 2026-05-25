import { StatusFilterSelect } from "./states/statusFilterSelect";

type Props = {
  status: string; setStatus: (v: string) => void;
  owner: string; setOwner: (v: string) => void;
  from: string; setFrom: (v: string) => void;
  to: string; setTo: (v: string) => void;
  owners: string[];
  stateOptions: any[]; 
  onAnyChange: () => void;
};

export function TasksFilters({
  status, setStatus, owner, setOwner, from, setFrom, to, setTo,
  owners, stateOptions, onAnyChange,
}: Props) {
  return (
    <div className="sticky top-0 z-[1] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-end px-4 py-3">
        <div className="w-full md:w-48">
          <span className="block text-xs text-gray-500 mb-1">Estado</span>
          <StatusFilterSelect
            value={status}
            onChange={(v) => { setStatus(v); onAnyChange(); }}
            options={stateOptions}
          />
        </div>

        <label className="w-full md:w-56">
          <span className="block text-xs text-gray-500 mb-1">Responsable</span>
          <select
            value={owner}
            onChange={(e) => { setOwner(e.target.value); onAnyChange(); }}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="Todos">Todos</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto min-w-0">
          <label className="min-w-0">
            <span className="block text-xs text-gray-500 mb-1">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); onAnyChange(); }}
              className="w-full min-w-0 shrink rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>

          <label className="min-w-0">
            <span className="block text-xs text-gray-500 mb-1">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); onAnyChange(); }}
              className="w-full min-w-0 shrink rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
