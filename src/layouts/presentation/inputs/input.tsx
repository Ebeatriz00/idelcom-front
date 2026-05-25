type UpperInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  mode?: "upper" | "lower" | "capitalize" | "section" | "first";
  onlyNumbers?: boolean;
  maxLength?: number;
};

export function UpperInput({
  value,
  onValueChange,
  mode = "upper",
  onlyNumbers = false,
  maxLength,
  ...rest
}: UpperInputProps) {
  const transform = (txt: string) => {
    switch (mode) {
      case "upper":
        return txt.toUpperCase();
      case "lower":
        return txt.toLowerCase();
      case "capitalize":
        return txt.replace(
          /\b\w+/g,
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
      case "section":
        return txt.trim().replace(/\s+/g, "_");
      case "first":
        return txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : "";
      default:
        return txt;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (onlyNumbers) {
      newValue = newValue.replace(/\D/g, "");
    }

    if (maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    newValue = transform(newValue);

    onValueChange(newValue);
  };

  return (
    <input
      {...rest}
      value={value}
      onChange={handleChange}
      type="text"
      inputMode={onlyNumbers ? "numeric" : undefined}
      autoCapitalize="none"
    />
  );
}
