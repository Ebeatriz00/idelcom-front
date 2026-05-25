import { Search, Plus, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import type { WorkerResponseDto } from "@/application";
import { statusToBool } from "@/sharedKernel";

type Props = {
  items: WorkerResponseDto[];
  total: number;
  pageCount: number;
  pageIndex: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (q: string) => void;
  onPageChange: (newPageIndex: number) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate?: () => void;
};

function getAvatarColor(name?: string) {
  if (!name) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  const colors = [
    'bg-indigo-50 text-indigo-700 border-indigo-100/50',
    'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    'bg-amber-50 text-amber-700 border-amber-100/50',
    'bg-violet-50 text-violet-700 border-violet-100/50',
    'bg-rose-50 text-rose-700 border-rose-100/50',
    'bg-blue-50 text-blue-700 border-blue-100/50',
    'bg-cyan-50 text-cyan-700 border-cyan-100/50',
    'bg-teal-50 text-teal-700 border-teal-100/50'
  ];
  return colors[charCode % colors.length];
}

export function WorkerListPanel({
  items, total, pageCount, pageIndex, isLoading,
  search, onSearchChange, onPageChange,
  selectedId, onSelect, onCreate
}: Props) {
  return (
    <div className="w-full md:w-[380px] bg-white border-r border-zinc-200 flex flex-col shrink-0 h-full">
      <div className="p-5 border-b border-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-zinc-800">Directorio</h1>
          {onCreate && (
            <button 
              onClick={onCreate}
              className="bg-zinc-900 text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar personal..." 
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-100/80 border-transparent rounded-xl text-sm focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100 transition-all outline-none"
            />
          </div>
          <button className="p-2 bg-zinc-100/80 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors border border-transparent">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-zinc-500 font-medium flex justify-between">
          <span>{total} resultados totales</span>
          {isLoading && <span className="text-blue-500 animate-pulse">Cargando...</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar relative">
        {items.map((worker) => {
          const isSelected = worker.workerId === selectedId;
          const isActive = statusToBool(worker.status);
          const avatarColorClass = getAvatarColor(worker.workerFullName);
          
          return (
            <div 
              key={worker.workerId}
              onClick={() => worker.workerId && onSelect(worker.workerId)}
              className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected 
                  ? 'bg-blue-50/40 border-blue-100/80 shadow-sm pl-4' 
                  : 'bg-transparent border-transparent hover:bg-zinc-50/80 hover:border-zinc-200/50'
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
              )}
              
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border uppercase ${avatarColorClass}`}>
                   {worker.workerFullName?.charAt(0) ?? 'W'}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-zinc-800'}`}>
                  {worker.workerFullName}
                </h3>
                <p className="text-xs text-zinc-500 truncate">{(worker as any).jobTitle ?? 'Sin Cargo'}</p>
              </div>
              
              {isSelected && <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />}
            </div>
          );
        })}

        {!isLoading && items.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-zinc-400">
            <span className="text-sm font-medium">No se encontraron resultados</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
        <button 
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="p-1.5 rounded-md hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-zinc-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-zinc-500">
          Pág {pageIndex + 1} de {pageCount || 1}
        </span>
        <button 
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          className="p-1.5 rounded-md hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-zinc-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}