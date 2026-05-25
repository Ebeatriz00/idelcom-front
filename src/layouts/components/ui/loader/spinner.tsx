type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-3 w-3 border-[2px]",
  sm: "h-4 w-4 border-[2px]",
  md: "h-5 w-5 border-[3px]",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "sm", className = "" }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full border-transparent border-t-current animate-spin ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
