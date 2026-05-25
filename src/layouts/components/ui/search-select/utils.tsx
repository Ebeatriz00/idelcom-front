// search-select/utils.tsx
export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const makeHighlighter = (q: string) => {
  const qq = q.trim();
  if (!qq) return (s: string) => s;
  const partsRe = new RegExp(`(${escapeRegExp(qq)})`, "i");
  return (s: string) => {
    if (!partsRe.test(s)) return s;
    return s.split(partsRe).map((p, i) =>
      i % 2 ? <mark key={i} className="rounded-[2px] bg-yellow-100 px-0.5">{p}</mark> : <span key={i}>{p}</span>
    );
  };
};
