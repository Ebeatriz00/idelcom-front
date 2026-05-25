// search-select/Input.tsx
import { Loader2, X } from "lucide-react";
export function SSInput({
  inputRef, search, setSearch, onKeyDown, placeholder, disabled, open, setOpen,
  isBusy, hasValue, onClear, inputClassName = "", textClassName = "",
}: any) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-2.5 py-2 transition-all duration-200 ${
        open 
          ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm" 
          : "border-gray-300 hover:border-gray-400"
      } ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "bg-white cursor-text"} ${inputClassName}`}
      role="combobox" aria-expanded={open} aria-haspopup="listbox"
      onClick={() => !disabled && setOpen(true)}
    >
      <input
        ref={inputRef} value={search} disabled={disabled}
        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
        onKeyDown={onKeyDown} onFocus={() => !disabled && setOpen(true)}
        placeholder={placeholder} className={`w-full bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400 ${textClassName}`}
      />
      {isBusy ? <Loader2 className="size-4 animate-spin shrink-0" /> :
        (hasValue && !disabled ? (
          <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onClear(); }}>
            <X className="size-4" />
          </button>
        ) : null)}
    </div>
  );
}
