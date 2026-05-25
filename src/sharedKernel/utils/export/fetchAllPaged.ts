import type { FetchAllProgress, PageResult } from "./types";
export async function fetchAllPaged<T>(args: {
  pageSize?: number;
  fetchPage: (pageIndex: number, pageSize: number) => Promise<PageResult<T>>;
  onProgress?: (p: FetchAllProgress) => void;
}) {
  const pageSize = args.pageSize ?? 1000;
  let pageIndex = 0;
  const all: T[] = [];

  let total: number | undefined;
  let pageCount: number | undefined;

  while (true) {
    const res = await args.fetchPage(pageIndex, pageSize);

    const items = res.data ?? [];
    all.push(...items);

    total = res.total ?? total;
    pageCount = res.pageCount ?? pageCount;

    const pct =
      total != null && total > 0
        ? Math.min(100, Math.round((all.length / total) * 100))
        : pageCount != null && pageCount > 0
          ? Math.min(100, Math.round(((pageIndex + 1) / pageCount) * 100))
          : undefined;

    args.onProgress?.({
      loaded: all.length,
      total,
      pageIndex,
      pageSize,
      pageCount,
      pct,
    });

    if (!items.length) break;
    if (pageCount != null && pageIndex + 1 >= pageCount) break;
    if (total != null && all.length >= total) break;

    pageIndex++;
  }

  return all;
}
