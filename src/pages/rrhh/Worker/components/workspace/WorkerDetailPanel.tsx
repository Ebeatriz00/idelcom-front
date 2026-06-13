import {
  Mail, Phone, Shield, Building, Edit, MoreHorizontal,
  CheckCircle2, Briefcase, MapPin, Calendar, CreditCard,
  Power, User, Landmark, Users, BriefcaseBusiness
} from 'lucide-react';
import { statusToBool } from "@/sharedKernel";
import { DetailCard, DetailRow } from './ui'; // Asumiendo que separaste los componentes

type Props = {
  worker: any;
  isLoading: boolean;
  canEdit: boolean;
  canEditStatus: boolean;
  onEdit: (id: number) => void;
  onToggleStatus: (row: any) => void;
};

export function WorkerDetailPanel({ worker, isLoading, canEdit, canEditStatus, onEdit, onToggleStatus }: Props) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <span className="animate-pulse text-zinc-400 font-medium">Cargando expediente...</span>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/30 relative overflow-hidden h-full border-l border-zinc-200">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md border border-zinc-100 text-zinc-400">
            <Briefcase className="w-7 h-7 text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 tracking-tight">Expediente de Colaborador</h3>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            Selecciona un colaborador del directorio de la izquierda para visualizar su expediente completo, datos de contacto y detalles de nómina.
          </p>
        </div>
      </div>
    );
  }

  const isActive = statusToBool(worker.status ?? "1");
  const fullName = `${worker.workerName ?? ''} ${worker.workerLastName ?? ''}`.trim();
  const avatarInitials = fullName.charAt(0) || 'W';
  const formatDate = (dateStr?: string) => dateStr ? new Intl.DateTimeFormat("es-PE").format(new Date(dateStr)) : '—';

  return (
    <div className="flex-1 flex flex-col bg-zinc-50/50 overflow-hidden h-full border-l border-zinc-200">

      <div className="shrink-0 relative bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 border-b border-zinc-800 w-full overflow-hidden select-none px-8 py-6 flex flex-col gap-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80"></div>

        <div className="flex justify-end relative z-10">
          <div className="flex gap-2">
            {canEditStatus && (
              <button
                onClick={() => onToggleStatus(worker)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border shadow-sm ${isActive
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
              >
                <Power className="w-4 h-4" /> {isActive ? 'Inhabilitar' : 'Habilitar'}
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit(worker.workerId)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 shadow-sm"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
            )}
            <button className="bg-white/5 hover:bg-white/10 text-white p-1.5 rounded-lg transition-colors border border-white/10 backdrop-blur-sm">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg border-2 border-white/10 select-none">
                {avatarInitials}
              </div>
              {isActive && (
                <div className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-full p-0.5 shadow-md border border-zinc-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white leading-none">{fullName}</h2>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Briefcase className="w-4 h-4 text-blue-400" /> {worker.jobTitleName || worker.prevJob || 'Sin Cargo Asignado'}
                </span>
                <span className="text-zinc-800">•</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Building className="w-4 h-4 text-blue-400" /> {worker.areaName || 'Área General'}
                </span>
              </div>
            </div>
          </div>

          <div>
            {isActive ? (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Activo</span>
            ) : (
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Inactivo</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">

            <DetailCard icon={User}    title="Información Personal">
            <DetailRow icon={Shield}   label="Documento"               value={`${worker.documentTypeName} - ${worker.workerDocument}`} />
            <DetailRow icon={Calendar} label="Nacimiento"              value={formatDate(worker.birthDate)} />
            <DetailRow icon={Users}    label="Hijos"                   value={worker.numberChildren ?? '0'} />
            <DetailRow icon={Phone}    label="Teléfono"                value={worker.phone || '—'} />
            <DetailRow icon={Mail}     label="Correo"                  valueClassName="truncate" value={<span title={worker.email}>{worker.email || '—'}</span>} />
            <DetailRow icon={MapPin}   label="Ubicación"               isLast value={
              <>
                <p>{worker.address || 'Sin dirección registrada'}</p>
                <p className="text-xs text-zinc-500 font-normal mt-0.5">
                  {[worker.districtName, worker.provinceName, worker.departmentName].filter(Boolean).join(' - ') || '—'}
                </p>
              </>
            } />
          </DetailCard>

          <DetailCard icon={BriefcaseBusiness} title="Información Laboral">
            <DetailRow label="Área"         value={worker.areaName || '—'} />
            <DetailRow label="Cargo"        value={worker.jobTitleName || '—'} />
            <DetailRow label="F. Ingreso"   valueClassName="text-blue-600" value={formatDate(worker.dateEntry)} />
            <DetailRow label="F. Cese"      valueClassName="text-rose-600" value={formatDate(worker.dateCes)} />
            <DetailRow label="Salario"      value={worker.salary ? `S/ ${Number(worker.salary).toFixed(2)}` : '—'} />
            <DetailRow label="Emp. Previo"  isLast value={<span className="leading-snug">{worker.prevJob || '—'}</span>} />
          </DetailCard>

          <DetailCard icon={Landmark} title="Datos Bancarios" className="xl:col-span-2 2xl:col-span-1">
            <DetailRow label="Banco" value={
              <span className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" /> {worker.bankName || '—'}
              </span>
            } />
            <DetailRow label="N° Cuenta" valueClassName="tracking-wide" value={worker.ccBank || '—'} />
            <DetailRow label="CCI" isLast valueClassName="tracking-wide" value={worker.cciBank || '—'} />

            {!worker.bankId && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Sin datos de nómina</p>
                  <p className="text-xs text-amber-700 mt-1">Este colaborador no tiene una cuenta bancaria registrada para sus depósitos.</p>
                </div>
              </div>
            )}
          </DetailCard>

        </div>
      </div>
    </div>
  );
}