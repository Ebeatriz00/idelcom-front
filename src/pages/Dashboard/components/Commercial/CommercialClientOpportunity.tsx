import type { OptionItem } from "@/application";
import { SearchSelect } from "@/layouts";
import { useClientsOptions } from "@/sharedKernel";
import { useDashboardMetricsClientOpportunity } from "@/sharedKernel/hooks/dashboard/useDashboardCommercial";
import { Loader2, Users, FilterX, Table as TableIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  usersId?: number;
  quarter?: number;
  year?: number;
}

// MODIFICADO: Lógica dinámica de años (Igual que los anteriores)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_OPTION = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export const CommercialClientOpportunity = ({ usersId, quarter, year }: Props) => {
  // Inicializamos con el año actual calculado
  const [selectedYear, setSelectedYear] = useState<number>(year || CURRENT_YEAR);
  const [selectedClient, setSelectedClient] = useState<OptionItem | null>(null);

  const activeClientId = selectedClient?.value ? Number(selectedClient.value) : undefined;

  const { data, isLoading } = useDashboardMetricsClientOpportunity(usersId, quarter, selectedYear, activeClientId);

  const { chartData, tableRows, clientColumns, uniqueStateIds, stateMeta, clientMeta } = useMemo(() => {
    const safeData = data || [];
    
    const stateMeta: Record<number, { label: string; color: string }> = {};
    const clientMeta: Record<number, string> = {};

    safeData.forEach((item) => {
      if (!stateMeta[item.stateOpportunityId]) {
        stateMeta[item.stateOpportunityId] = {
            label: item.stateName, 
            color: item.stateColor 
        };
      }
      if (!clientMeta[item.clientId]) {
        clientMeta[item.clientId] = item.clientName;
      }
    });

    const uniqueStateIds = Object.keys(stateMeta).map(Number).sort((a,b) => a - b);
    const uniqueClientIds = Object.keys(clientMeta).map(Number);

    const chartData = uniqueClientIds.map((clientId) => {
        const clientName = clientMeta[clientId];
        // Recortar nombres muy largos para el gráfico
        const shortName = clientName.length > 12 ? clientName.substring(0, 10) + '...' : clientName;
        const entry: any = { name: shortName, fullName: clientName, clientId: clientId };

        uniqueStateIds.forEach(stateId => {
            const match = safeData.find(d => d.clientId === clientId && d.stateOpportunityId === stateId);
            entry[`state_${stateId}`] = match ? match.totalAmount : 0;
        });
        return entry;
    });

    const tableRows = uniqueStateIds.map((stateId) => {
        const meta = stateMeta[stateId];
        const rowData: any = {
            id: stateId,
            label: meta.label,
            color: meta.color
        };
        uniqueClientIds.forEach(clientId => {
            const match = safeData.find(d => d.stateOpportunityId === stateId && d.clientId === clientId);
            rowData[`client_${clientId}`] = match ? match.totalAmount : 0;
        });
        return rowData;
    });

    return { chartData, tableRows, clientColumns: uniqueClientIds, uniqueStateIds, stateMeta, clientMeta };
  }, [data]);

  const currencyFormatter = (value?: number) => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-[550px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="animate-spin text-slate-400 size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
             <Users className="size-5" />
            </div>
            <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                OPORTUNIDAD POR CLIENTE
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
                {activeClientId ? "Vista Detallada de Cliente" : `Top 5 Clientes (${selectedYear})`}
            </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
             <select 
                value={selectedYear}
                onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedClient(null);
                }}
                className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none mr-2"
            >
                {/* MODIFICADO: Renderizado dinámico de años */}
                {YEARS_OPTION.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>

      <div className="flex w-full flex-col lg:flex-row">
          
          <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 p-4 shrink-0 flex flex-col gap-4">
            
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Search className="size-3" />
                    Buscar Cliente:
                </label>
                
                <SearchSelect
                    useOptions={useClientsOptions}
                    value={selectedClient}
                    onChange={(opt) => setSelectedClient(opt)}
                    placeholder="Escribe para buscar..."
                    className="w-full bg-white" 
                />

                {activeClientId && (
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border border-red-100 w-full mt-2"
                    >
                        <FilterX className="size-3" />
                        Limpiar Filtro
                    </button>
                )}
            </div>

            <div className="mt-auto bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                 <h5 className="text-[10px] font-bold text-slate-800 mb-1">
                    {activeClientId ? "Filtro Activo" : "Resumen Top 5"}
                 </h5>
                 <div className="text-xs text-slate-500 leading-relaxed">
                    {activeClientId ? (
                        <>Datos filtrados para: <br/><strong className="text-slate-700">{selectedClient?.label}</strong></>
                    ) : (
                        "Mostrando los 5 clientes con mayor volumen."
                    )}
                 </div>
            </div>

          </div>

          <div className="flex-1 flex flex-col min-w-0">
             <div className="w-full h-[350px] lg:h-[400px] p-4 bg-white">
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        barGap={4} 
                    >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        axisLine={false} tickLine={false} dy={10}
                        interval={0} 
                    />
                    <YAxis 
                        tickFormatter={(val) => `$${val/1000}k`} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} 
                        axisLine={false} tickLine={false} 
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const dataItem = payload[0].payload;
                            return (
                            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50 max-w-[220px]">
                                <p className="font-bold text-slate-800 mb-2 border-b pb-1 break-words">{dataItem.fullName}</p>
                                {payload.map((entry: any) => (
                                entry.value > 0 && (
                                    <div key={entry.name} className="flex items-center gap-2 mb-1 justify-between">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                            <span className="text-slate-500 capitalize truncate">{entry.name}</span>
                                        </div>
                                        <span className="font-mono font-semibold text-slate-700">{currencyFormatter(entry.value as number)}</span>
                                    </div>
                                )
                                ))}
                            </div>
                            );
                        }
                        return null;
                        }}
                    />
                    {uniqueStateIds.map((stateId) => {
                        const meta = stateMeta[stateId];
                        return (
                            <Bar
                                key={stateId}
                                dataKey={`state_${stateId}`}
                                name={meta.label}
                                fill={meta.color}
                                radius={[2, 2, 0, 0]} 
                                barSize={activeClientId ? 60 : 30}
                            />
                        );
                    })}
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                    {activeClientId 
                        ? "Este cliente no tiene datos en el periodo seleccionado" 
                        : `Sin datos disponibles en ${selectedYear}`
                    }
                </div>
                )}
            </div>
          </div>
      </div>

      {/* MATRIZ INFERIOR */}
      <div className="border-t border-slate-200 bg-white overflow-x-auto">
        <div className="min-w-[700px] p-5">
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="p-1 rounded bg-slate-100 text-slate-500">
                    <TableIcon className="size-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Detalle por Cliente
                </h4>
            </div>
            
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-300 shadow-sm table-fixed">
                <thead>
                    <tr>
                        <th className="w-[180px] text-left py-3 px-4 text-slate-500 font-bold border-b border-r border-slate-300 bg-slate-50 sticky left-0 z-10">
                            ESTADO
                        </th>
                        {clientColumns.map(clientId => (
                            <th key={clientId} className="text-center py-3 px-2 text-slate-500 font-bold border-b border-r border-slate-300 bg-slate-50 truncate">
                                <span title={clientMeta[clientId]}>{clientMeta[clientId]}</span>
                            </th>
                        ))}
                         {clientColumns.length === 0 && <th className="py-3 px-4 bg-slate-50 border-b border-slate-300 w-auto"></th>}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {tableRows.map((row: any, index: number) => (
                        <tr key={row.id} className={`transition-colors border-b border-slate-300 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-orange-50/50`}>
                            <td className={`py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                                    <span className="uppercase truncate">{row.label}</span>
                                </div>
                            </td>
                            {clientColumns.map(clientId => (
                                <td key={clientId} className="text-right py-3 px-4 text-slate-600 font-mono border-r border-slate-300">
                                    {currencyFormatter(row[`client_${clientId}`])}
                                </td>
                            ))}
                             {clientColumns.length === 0 && <td className="py-3 px-4 border-r border-slate-300"></td>}
                        </tr>
                    ))}
                    
                    <tr className="bg-purple-50/50 font-bold border-t-2 border-purple-200">
                        <td className="py-3 px-4 text-purple-900 text-right sticky left-0 bg-purple-50 z-10 border-r border-purple-200">
                            TOTAL GENERAL
                        </td>
                        {clientColumns.map(clientId => {
                            const totalCol = tableRows.reduce((acc: number, row: any) => acc + (row[`client_${clientId}`] || 0), 0);
                            return (
                                <td key={clientId} className="text-right py-3 px-4 text-purple-900 font-mono border-r border-purple-200">
                                    {currencyFormatter(totalCol)}
                                </td>
                            );
                        })}
                         {clientColumns.length === 0 && <td className="py-3 px-4 border-r border-purple-200"></td>}
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
      
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
    </div>
  );
};