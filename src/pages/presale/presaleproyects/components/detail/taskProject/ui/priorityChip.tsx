import { Flag } from "lucide-react";
import { cn } from "@/sharedKernel";
import { bgToTextClass } from "../../../ui/colorMap"; 

type Props = {
  desc?: string;
  color?: string; 
};

export function PriorityChip({ desc, color }: Props) {
  const label = desc || "Normal";
  const isHex = color?.startsWith("#");
  
  const colorClass = (!isHex && color) ? bgToTextClass(color) : ""; 

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-gray-200 bg-white transition-colors",
        colorClass || "text-gray-600"
      )}
      style={isHex ? { color: color, borderColor: color + '40' } : undefined}
    >
      <Flag size={12} className="fill-current" />
      <span className="text-[11px] font-medium">
        {label}
      </span>
    </div>
  );
}