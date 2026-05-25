import React from "react";

type UpperTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onValueChange: React.Dispatch<React.SetStateAction<string>>;
  mode?: "upper" | "lower" | "none";
};

export function UpperTextarea({
  value,
  onValueChange,
  mode = "upper",
  ...rest
}: UpperTextareaProps) {
  return (
    <textarea
      {...rest}
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        const t =
          mode === "upper"
            ? v.toUpperCase()
            : mode === "lower"
            ? v.toLowerCase()
            : v;
        onValueChange(t);
      }}
    />
  );
}
