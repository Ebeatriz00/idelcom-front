import type { LucideIcon } from "lucide-react";
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
interface StatCardProps {
  label: string;
  value: string | number;
  accent: string;
  icon: LucideIcon;
  sub?: string;
}
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
const AccentGlow = ({ accent }: { accent: string }) => (
  <div
    className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-[0.04] blur-sm group-hover:scale-125 transition-transform duration-500"
    style={{ backgroundColor: accent }}
  />
);
 
const AccentBar = ({ accent }: { accent: string }) => (
  <div
    className="absolute top-0 left-0 w-[4px] h-full"
    style={{ backgroundColor: accent }}
  />
);
 
const IconBadge = ({ accent, icon: Icon }: { accent: string; icon: LucideIcon }) => (
  <div
    className="p-3 rounded-xl transition-all duration-300 group-hover:scale-105"
    style={{ backgroundColor: `${accent}10`, color: accent }}
  >
    <Icon size={20} strokeWidth={2.5} />
  </div>
);
 
const SubLabel = ({ accent, text }: { accent: string; text: string }) => (
  <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
    <span
      className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
      style={{ backgroundColor: accent }}
    />
    {text}
  </p>
);
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
export const StatCard = ({ label, value, accent, icon, sub }: StatCardProps) => (
  <div className="relative overflow-hidden bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
    <AccentGlow accent={accent} />
    <AccentBar accent={accent} />
 
    <div className="flex items-center justify-between relative z-10">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight tabular-nums">
          {value}
        </h3>
        {sub && <SubLabel accent={accent} text={sub} />}
      </div>
 
      <IconBadge accent={accent} icon={icon} />
    </div>
  </div>
);