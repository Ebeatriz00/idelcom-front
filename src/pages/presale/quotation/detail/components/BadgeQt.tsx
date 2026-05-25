import { cn } from "@/sharedKernel";

export type Tone = "neutral" | "info" | "success" | "warn" | "danger";

export const tones: Record<Tone, string> = {
  neutral: "border-gray-200 bg-gray-100 text-gray-800",
  info: "border-blue-200 bg-blue-100 text-blue-800",
  success: "border-green-200 bg-green-100 text-green-800",
  warn: "border-yellow-200 bg-yellow-100 text-yellow-800",
  danger: "border-red-200 bg-red-100 text-red-800",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
