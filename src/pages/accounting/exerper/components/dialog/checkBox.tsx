import { useEffect, useRef } from "react";

export function Checkbox({
  checked,
  indeterminate,
  onCheckedChange, 
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (value: boolean) => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={ariaLabel}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  );
}