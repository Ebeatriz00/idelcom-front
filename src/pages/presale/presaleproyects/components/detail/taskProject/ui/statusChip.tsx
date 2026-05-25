import { bgToTextClass } from "../../../ui/colorMap";
import { cn } from "@/sharedKernel";

type Props = {
  label?: string | null;
  stateColor?: string | null;
  numPercPro?: number | null;
  onlyIcon?: boolean; 
};

export function StatusChip({
  label,
  stateColor,
  numPercPro,
  onlyIcon = false, 
}: Props) {
  const text = (label || "Pendiente").trim();
  
  // Detectamos si es un color Hexadecimal
  const isHex = !!stateColor && stateColor.startsWith("#");
  
  // Si NO es hex, intentamos convertir la clase bg- a text-
  const colorClass = !isHex ? bgToTextClass(stateColor) : ""; 

  const pct = Math.max(0, Math.min(100, numPercPro ?? 0));
  const R = 6; 
  const C = 2 * Math.PI * R; 
  const dash = C;
  const offset = C * (1 - pct / 100);

  const ProgressCircle = (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        // Si no es Hex, usamos la clase. Si es Hex, se aplica en style.
        className={cn("rotate-[-90deg]", colorClass)} 
        // Esto permite que el 'currentColor' del stroke tome el valor Hex
        style={isHex ? { color: stateColor! } : undefined}
    >
      <circle 
        cx="8" 
        cy="8" 
        r={R} 
        fill="none" 
        stroke="currentColor" 
        strokeOpacity="0.2" 
        strokeWidth="2.5" 
      />
      
      <circle
        cx="8"
        cy="8"
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={dash}
        strokeDashoffset={pct === 0 ? dash : offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out" 
      />
    </svg>
  );

  if (onlyIcon) {
    return (
      <div title={`${text} (${pct}%)`} className="flex items-center justify-center p-0.5">
        {ProgressCircle}
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-[3px] text-[11px] font-medium text-gray-700"
      title={`${text} (${pct}%)`}
    >
      <div className="size-3.5 flex items-center justify-center">
        {ProgressCircle}
      </div>
      {text}
    </span>
  );
}