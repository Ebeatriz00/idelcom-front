import type { LucideIcon } from 'lucide-react';
import React from 'react';

export function DetailCard({ 
  icon: Icon, 
  title, 
  children, 
  className = "" 
}: { 
  icon: LucideIcon, 
  title: string, 
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div className={`group bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:border-zinc-300/80 p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 ${className}`}>
      <h3 className="text-sm font-bold text-zinc-800 mb-5 flex items-center gap-3">
        <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <span className="tracking-tight text-zinc-950 font-semibold">{title}</span>
      </h3>
      <div className="space-y-4 flex-1">
        {children}
      </div>
    </div>
  );
}

export function DetailRow({ 
  icon: Icon, 
  label, 
  value, 
  valueClassName = "",
  isLast = false
}: { 
  icon?: LucideIcon, 
  label: string, 
  value: React.ReactNode,
  valueClassName?: string,
  isLast?: boolean
}) {
  return (
    <div className={`grid grid-cols-3 ${isLast ? 'items-start pt-1' : 'items-center border-b border-zinc-100 pb-3.5'}`}>
      <span className={`text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5 ${isLast ? 'mt-0.5' : ''}`}>
        {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400/80" />} {label}
      </span>
      <div className={`col-span-2 text-sm text-zinc-800 font-semibold leading-relaxed ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}