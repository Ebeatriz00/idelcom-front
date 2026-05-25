type Option = { value: string; label: string };

export default function RadioGroup({
  name,
  options,
  defaultValue,
  value,
  onChange,
  disabled,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const isControlled = value !== undefined;

  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 text-sm ${
            disabled ? "opacity-60" : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            {...(isControlled && {
              checked: value === opt.value,
            })}
            {...(!isControlled && {
              defaultChecked: defaultValue === opt.value,
            })}
            onChange={() => onChange?.(opt.value)}
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
