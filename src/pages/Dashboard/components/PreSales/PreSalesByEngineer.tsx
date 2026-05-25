import { useState, useMemo, useEffect } from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Loader2, 
  BarChart3, 
  Filter, 
  FileText, 
  SearchX,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"; 
import { 
  useDashboardMetricsPreSalesByEngineer, 
  useDashboardMetricsPreSalesByEngineerDetails 
} from '@/sharedKernel/hooks/dashboard/useDashboardPreSales';
import type { 
  DashboardPreSalesByEngineer, 
} from '@/application/dtos/dashboard/dashboardPreSales/dashboardPreSales.dto';
import { useNavigate } from "react-router-dom";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

const THEME = {
  barColor: '#10b981', 
  lineColor: '#f59e0b', 
  wonColor: '#0ea5e9'
};

const ITEMS_PER_PAGE = 10;

export const DashboardPreSalesByEngineerPieChart = ({ usersId, quarter, year }: Props) => {
  const [selectedStateId, setSelectedStateId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: chartData, isLoading: isLoadingChart } = useDashboardMetricsPreSalesByEngineer(usersId, quarter, year, selectedStateId);
  const { data: tableData, isLoading: isLoadingTable } = useDashboardMetricsPreSalesByEngineerDetails(usersId, quarter, year, selectedStateId);

  const { paginatedData, totalPages, filteredCount } = useMemo(() => {
    if (!tableData) return { paginatedData: [], totalPages: 0, filteredCount: 0 };

    const filtered = tableData.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.opporNum.toLowerCase().includes(term) ||
        item.opporDesc.toLowerCase().includes(term) ||
        item.responsible.toLowerCase().includes(term)
      );
    });

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { 
      paginatedData: paginated, 
      totalPages: total,
      filteredCount: filtered.length 
    };
  }, [tableData, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalAmount = chartData?.reduce((acc, curr) => acc + curr.generalAmount, 0) || 0;

  const formatCurrencyAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const currencyFormatter = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoadingChart || isLoadingTable) {
    return (
      <div className="h-[480px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* SECCIÓN DEL GRÁFICO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[480px] w-full relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Rendimiento por Responsable</h3>
              <p className="text-[11px] text-slate-400 font-medium text-balance">Monto Cotizado vs. Cantidad de Cotizaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="pl-2 text-slate-400"><Filter className="size-3.5" /></div>
            <select
              className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer py-1 pr-2 min-w-[130px]"
              value={selectedStateId ?? ""}
              onChange={(e) => setSelectedStateId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todos los Estados</option>
              <option value="4">Propuesta</option>
              <option value="8">En Negociación</option>
              <option value="11">Perdida</option>
              <option value="19">Ganada</option>
            </select>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] w-full p-6 pt-4">
          {!chartData || chartData.length === 0 || totalAmount === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-3">
                <BarChart3 className="size-10 text-slate-200" />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">No hay datos</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData as any[]} margin={{ top: 10, right: 0, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="responsible" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} dx={-10} />
                <YAxis yAxisId="right" orientation="right" hide={true} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as DashboardPreSalesByEngineer;
                      return (
                        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl min-w-[240px]">
                          <p className="text-[11px] font-black text-slate-500 uppercase mb-3 border-b border-slate-100 pb-2">{item.responsible}</p>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Monto General:</span>
                              <span className="font-bold text-emerald-600">{currencyFormatter(item.generalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Monto Ganado:</span>
                              <span className="font-bold text-sky-600">{currencyFormatter(item.closedAmount)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-slate-500">Proyectos:</span>
                              <span className="font-black text-amber-600">{item.totalVersions}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748b', paddingTop: '15px' }} />
                <Bar yAxisId="left" dataKey="generalAmount" name="Monto Cotizado" fill={THEME.barColor} radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="totalVersions" name="Cantidad de Proyectos" stroke={THEME.lineColor} strokeWidth={3} dot={{ r: 5, fill: THEME.lineColor, stroke: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600" />
      </div>

      {/* SECCIÓN DE LA TABLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Detalle de Proyectos</h3>
              <p className="text-[11px] text-slate-400 font-medium">Relación de oportunidades por responsable</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, Proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs transition duration-150 ease-in-out font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-white p-5">
          {!paginatedData || paginatedData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <SearchX className="size-8 text-slate-200" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {searchTerm ? "No se encontraron coincidencias" : "Sin registros disponibles"}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-300 shadow-sm">
              <thead>
                <tr>
                  <th className="w-[220px] text-left py-3 px-4 text-slate-500 font-black uppercase border-b border-r border-slate-300 bg-slate-50 sticky left-0 z-10">
                    Responsable
                  </th>
                  <th className="w-[120px] text-center py-3 px-2 text-slate-500 font-black uppercase border-b border-r border-slate-300 bg-slate-50">
                    Nº Oportunidad
                  </th>
                  
                  {/* COLUMNA DE CATEGORÍA ULTRA COMPACTA */}
                  <th className="w-[100px] text-center py-3 px-2 text-slate-500 font-black uppercase border-b border-r border-slate-300 bg-slate-50">
                    Categoría
                  </th>

                  <th className="text-left py-3 px-4 text-slate-500 font-black uppercase border-b border-r border-slate-300 bg-slate-50">
                    Descripción del Proyecto
                  </th>
                  <th className="w-[130px] text-right py-3 px-4 text-slate-500 font-black uppercase border-b border-slate-300 bg-slate-50">
                    Monto Cotizado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedData.map((item: any, index: number) => (
                  <tr 
                    key={`${item.opporNum}-${index}`} 
                    onClick={() => navigate(`/presale/presaleproyects/presaleproyects?search=${item.opporNum}`)}
                    className={`cursor-pointer transition-colors border-b border-slate-300 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-purple-50/50`}
                  >
                    
                    <td className={`align-middle py-3 px-4 font-bold text-slate-700 border-r border-slate-300 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2 uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        {item.responsible}
                      </div>
                    </td>
                    
                    <td className="align-middle py-3 px-2 text-center border-r border-slate-300">
                      <span className="inline-flex items-center justify-center px-1.5 py-1 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-100 uppercase">
                        {item.opporNum}
                      </span>
                    </td>
                    
                    <td className="align-middle py-2 px-2 text-center border-r border-slate-300">
                      {item.category === 1 ? (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded font-bold uppercase border border-emerald-200 shadow-sm whitespace-nowrap">
                            Estratégico
                        </span>
                      ) : item.category === 2 ? (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] rounded font-bold uppercase border border-purple-200 shadow-sm whitespace-nowrap" title="Complementario">
                            Complementario
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-bold uppercase border border-slate-200 shadow-sm whitespace-nowrap">
                            Sin Cat.
                        </span>
                      )}
                    </td>
                    
                    <td className="align-middle py-3 px-4 text-slate-600 font-medium leading-relaxed border-r border-slate-300">
                      {item.opporDesc}
                    </td>

                    <td className="align-middle py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {item.generalAmount ? currencyFormatter(item.generalAmount) : "-"}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredCount > 0 && (
          <div className="bg-white px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              Mostrando <span className="font-bold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCount)}</span> de <span className="font-bold text-slate-700">{filteredCount}</span> resultados
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-600 px-2">
                Pág. {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
      </div>

    </div>
  );
};