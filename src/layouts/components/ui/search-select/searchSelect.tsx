import type { OptionItem } from "@/application";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SSFooter } from "./Footer";
import { SSInput } from "./Input";
import { OptionsList } from "./OptionsList";
import { Popover } from "./Popover";
import type { UseOptionsHook } from "./types";
import { useSearchSelect } from "./useSearchSelect";
import { makeHighlighter } from "./utils";

export function SearchSelect({
  useOptions,
  value,
  onChange,
  placeholder = "Buscar...",
  pageSize = 10,
  minSearchChars = 0,
  className = "",
  inputClassName = "",
  textClassName = "",
  disabled = false,
  autofocus = false,
  onCreate,
  renderOption,
}: {
  useOptions: UseOptionsHook;
  value: OptionItem | null;
  onChange: (opt: OptionItem | null) => void;
  placeholder?: string;
  pageSize?: number;
  minSearchChars?: number;
  className?: string;
  inputClassName?: string;
  textClassName?: string;
  disabled?: boolean;
  autofocus?: boolean;
  onCreate?: (label: string) => void;
  renderOption?: (
    opt: OptionItem,
    q: string,
    selected: boolean,
    active: boolean,
  ) => React.ReactNode;
}) {
  const s = useSearchSelect({
    useOptions,
    value,
    pageSize,
    minSearchChars,
    autofocus,
  });

  const highlighter = useMemo(() => makeHighlighter(s.search), [s.search]);

  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const isGhost = !!(value as any)?.__ghost;
  const inputValue = s.open ? s.search : (value?.label ?? "");

  useEffect(() => {
    if (!s.open) {
      // cuando se cierra, mostramos el label del value en el input
      s.setSearch(value?.label ?? "");
      return;
    }

    // cuando se abre:
    // si es ghost, abrimos sin filtro (search vacío)
    if (isGhost) {
      s.setSearch("");
    } else {
      // si no es ghost, puedes decidir:
      // A) abrir con el label como filtro (comportamiento actual)
      // B) abrir vacío siempre
      // yo recomiendo vacío siempre para UX
      s.setSearch("");
    }
  }, [value, s.open, isGhost]);

  useLayoutEffect(() => {
    const updateRect = () => {
      if (s.open && s.inputRef.current) {
        setAnchorRect(s.inputRef.current.getBoundingClientRect());
      }
    };

    updateRect();

    if (s.open) {
      window.addEventListener("resize", updateRect);
      return () => {
        window.removeEventListener("resize", updateRect);
      };
    }
  }, [s.open, s.inputRef]);

  useEffect(() => {
    if (!s.open) return;

    const handleScroll = (e: Event) => {
      if (s.popoverRef.current?.contains(e.target as Node)) {
        return;
      }
      s.setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [s.open, s.setOpen]);

  function handleSearchChange(text: string) {
    s.setSearch(text);
    if (!s.open && !disabled) {
      s.setOpen(true);
    }
  }

  function onSelect(opt: OptionItem) {
    onChange(opt);
    s.setSearch(opt.label);
    s.setOpen(false);
  }

  function onClear() {
    onChange(null);
    s.setSearch("");
    s.setOpen(false);
    s.setActiveIndex(-1);
    s.inputRef.current?.focus();
  }

  return (
    <div className={`relative ${className}`}>
      <SSInput
        inputRef={s.inputRef}
        search={inputValue}
        setSearch={handleSearchChange}
        onKeyDown={s.onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        open={s.open}
        setOpen={s.setOpen}
        isBusy={s.isLoading || s.isFetching}
        hasValue={!!value}
        onClear={onClear}
        inputClassName={inputClassName}
        textClassName={textClassName}
      />

      {s.open && anchorRect && (
        <Popover open anchorRect={anchorRect} ref={s.popoverRef}>
          <OptionsList
            listRef={s.listRef}
            listboxId={s.listboxId}
            items={s.items}
            activeIndex={s.activeIndex}
            setActiveIndex={s.setActiveIndex}
            selectedValue={value?.value}
            onSelect={onSelect}
            renderOption={renderOption}
            highlighter={highlighter}
            isLoading={s.isLoading || s.isFetching}
            hasMore={s.hasMore}
            onCreate={onCreate}
            query={s.search.trim()}
          />
          <SSFooter
            currentPage={s.page}
            hasMore={s.hasMore}
            isFetching={s.isFetching}
            setPage={s.setPage}
            refetch={s.refetch}
          />
        </Popover>
      )}
    </div>
  );
}
