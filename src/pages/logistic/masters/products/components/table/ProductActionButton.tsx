import type { LucideIcon } from "lucide-react";

type ProductActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "slate" | "blue" | "emerald" | "rose";
};

const toneClass = {
  slate: "text-slate-500 hover:bg-muted hover:text-secondary",
  blue: "text-slate-500 hover:bg-primary-degrad hover:text-primary",
  emerald: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
  rose: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
};

export function ProductActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = "slate",
}: ProductActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${toneClass[tone]}`}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

