import React from "react";

type NumericValue = number | "";
type Props = {
  label?: string;
  value: NumericValue;
  onChange: (v: NumericValue) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
};

export function NumericField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = "Número",
  disabled,
  required,
  error,
  helperText,
  className = "",
  id,
}: Props) {
  function blockNonNumericKeys(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = new Set([
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ]);
    if (allowed.has(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    if (e.key === "Enter") return;
    e.preventDefault();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!/^\d+$/.test(text)) e.preventDefault();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") return onChange("");
    const normalized = raw.replace(/^0+(?=\d)/, "");
    const n = Number(normalized);
    if (!Number.isNaN(n)) {
      if (typeof max === "number" && n > max) return onChange(max);
      if (typeof min === "number" && n < min) return onChange(min);
      onChange(n);
    }
  }

  function stepBy(delta: number) {
    const base =
      value === "" ? (typeof min === "number" ? min : 0) : Number(value);
    let next = base + delta * step;
    if (typeof max === "number") next = Math.min(next, max);
    if (typeof min === "number") next = Math.max(next, min);
    onChange(next);
  }

  const inputId = id ?? React.useId();
  const hasError = Boolean(error);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-medium text-gray-600"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className={`flex items-stretch gap-1`}>
        <button
          type="button"
          onClick={() => stepBy(-1)}
          disabled={disabled}
          className="select-none rounded-lg border border-gray-200 bg-white px-3 text-sm disabled:opacity-50"
          aria-label="Decrementar"
        >
          −
        </button>

        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value === "" ? "" : value}
          onChange={handleChange}
          onKeyDown={blockNonNumericKeys}
          onPaste={handlePaste}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-gray-200 bg-gray-50 focus:ring-blue-500"
          }`}
        />

        <button
          type="button"
          onClick={() => stepBy(1)}
          disabled={disabled}
          className="select-none rounded-lg border border-gray-200 bg-white px-3 text-sm disabled:opacity-50"
          aria-label="Incrementar"
        >
          +
        </button>
      </div>

      {hasError ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
