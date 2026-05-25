import { resolveStateColor, type StateColorKey } from "./stateColor";

type ProgressBarProps = {
  value: number;
  colorKey?: StateColorKey;
  title?: string;
  showPercent?: boolean;
  widthClass?: string;
  heightClass?: string;
};

export function ProgressBar({
  value,
  colorKey,
  title,
  showPercent = true,
  widthClass = "w-28",
  heightClass = "h-2.5",
}: ProgressBarProps) {
  const bar = resolveStateColor(colorKey, "bg");

  return (
    <div className={`flex items-center gap-2 ${widthClass}`}>
      <div
        className={`relative flex-1 rounded-full bg-slate-100 ${heightClass} overflow-hidden`}
      >
        <div
          className={`h-full ${bar.className}`}
          style={{
            width: `${value}%`,
            ...(bar.style ?? {}),
          }}
        />
      </div>

      {showPercent && (
        <span className="text-xs text-slate-600" title={title}>
          {value}%
        </span>
      )}
    </div>
  );
}