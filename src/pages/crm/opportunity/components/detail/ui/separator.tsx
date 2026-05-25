import { cn } from "@/sharedKernel";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function SeparatorDetail({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <div
      className={cn(
        "bg-gray-200",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-4",
        className
      )}
    />
  );
}
