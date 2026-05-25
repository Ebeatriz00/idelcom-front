import type { OptionItem, PagedSelect } from "@/application";
import { useMemo } from "react";

/**
 * Adapter para usar SearchSelect con data local,
 * respetando el contrato real: data?: PagedSelect<OptionItem>
 */
export function makeLocalUseOptions(all: OptionItem[]) {
  return function useLocalOptions(
    page: number = 1,
    search: string = "",
    pageSize: number = 10,
    _opts?: { enabled?: boolean }
  ): {
    data?: PagedSelect<OptionItem>;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
  } {
    const term = (search ?? "").trim().toLowerCase();

    const filtered = useMemo(() => {
      if (!term) return all;
      return all.filter((o) =>
        String(o.label ?? "")
          .toLowerCase()
          .includes(term)
      );
    }, [all, term]);

    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, pageSize);

    const start = (safePage - 1) * safeSize;
    const items = useMemo(
      () => filtered.slice(start, start + safeSize),
      [filtered, start, safeSize]
    );

    const hasMore = start + safeSize < filtered.length;

    const data: PagedSelect<OptionItem> = {
      items,
      page: safePage,
      pageSize: safeSize,
      hasMore,
    };

    return {
      data,
      isLoading: false,
      isFetching: false,
      refetch: () => {},
    };
  };
}
