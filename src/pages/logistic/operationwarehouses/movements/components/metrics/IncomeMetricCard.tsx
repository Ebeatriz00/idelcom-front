import type { IncomeMetricCardProps } from "../../types/income.types";

export function IncomeMetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: IncomeMetricCardProps) {
  const toneClass = {
    primary: "bg-primary-degrad text-primary ring-primary/20",
    accent: "bg-accent/10 text-accent ring-accent/20",
    muted: "bg-muted text-muted-foreground ring-secondary/10",
    secondary: "bg-secondary text-white ring-secondary/20",
  }[tone];

  return (
    <div className="rounded-lg border border-secondary/10 bg-white p-4 shadow-sm transition hover:border-primary/25">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-semibold text-secondary">
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-2 ring-1 ${toneClass}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
