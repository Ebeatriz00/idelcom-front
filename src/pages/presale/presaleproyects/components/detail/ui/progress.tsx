import { cn } from "@/sharedKernel";

type ProgressDetailProps = {
  value: number | string;
  className?: string;
  showLabel?: boolean;
};

export function ProgressDetail({ value, className, showLabel = false }: ProgressDetailProps) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  const pct = n > 0 && n < 1 ? n * 100 : n; 
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div className={cn("relative w-full h-2 rounded-full bg-gray-100 overflow-hidden", className)}>
      <div
        className="absolute left-0 top-0 h-full bg-blue-500 transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
        title={`${Math.round(clamped)}%`} 
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-600">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}