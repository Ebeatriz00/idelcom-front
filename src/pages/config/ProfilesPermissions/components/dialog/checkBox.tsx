import { useEffect, useRef } from "react";

export function Checkbox({
  checked,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  ariaLabel,
  className = "",
  ...props
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={ariaLabel}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={`
        h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 
        focus:ring-2 focus:ring-offset-2 transition-colors
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      {...props}
    />
  );
}