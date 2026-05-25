type ToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
      
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {hint && (
          <div className="text-xs text-gray-500">{hint}</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition 
        ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>

    </div>
  );
}
