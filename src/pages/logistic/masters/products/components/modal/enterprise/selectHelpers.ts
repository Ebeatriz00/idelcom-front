import type { OptionItem, PagedSelect } from "@/application";
import type { UseOptionsHook } from "@/layouts/components/ui/search-select/types";

export const toNumberOptionValue = (value: unknown) =>
  value == null || value === "" ? undefined : Number(value);

export function pickOption(
  options: OptionItem[],
  value?: number,
  fallbackLabel?: string,
): OptionItem | null {
  if (value == null) return null;

  const found = options.find(
    (option) => toNumberOptionValue(option.value) === value,
  );

  return found ?? { value, label: fallbackLabel ?? `ID ${value}` };
}

export function buildLocalUseOptions(options: OptionItem[]): UseOptionsHook {
  return (page = 1, search = "", pageSize = 100) => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? options.filter((option) =>
          String(option.label ?? "").toLowerCase().includes(term),
        )
      : options;

    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, pageSize);
    const start = (safePage - 1) * safeSize;
    const items = filtered.slice(start, start + safeSize);
    const data: PagedSelect<OptionItem> = {
      items,
      page: safePage,
      pageSize: safeSize,
      hasMore: start + safeSize < filtered.length,
    };

    return {
      data,
      isLoading: false,
      isFetching: false,
      refetch: () => undefined,
    };
  };
}

