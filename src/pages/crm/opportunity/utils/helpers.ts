export function safeNum(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function parsePagination(sp: URLSearchParams) {
  const rawPage = sp.get("page");
  const rawSize = sp.get("size");

  let pageIndex = 0;
  let pageSize = 10;

  pageIndex = safeNum(rawPage, 0);
  pageSize = safeNum(rawSize, 10);

  if (rawPage && !Number.isFinite(Number(rawPage))) {
    try {
      const obj = JSON.parse(rawPage);
      pageIndex = safeNum(String(obj?.pageIndex), 0);
      pageSize = safeNum(String(obj?.pageSize), 10);
    } catch {
      pageIndex = 0;
      pageSize = 10;
    }
  }

  if (pageIndex < 0) pageIndex = 0;
  if (pageSize <= 0) pageSize = 10;

  return { pageIndex, pageSize };
}
