import { forwardRef, type ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: number;
  onValueChange: (value: number) => void;
};


export const NumberInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onValueChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        value={value}
        onChange={(e) => {
          const numericValue = Number(e.target.value);
          onValueChange(numericValue);
        }}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";