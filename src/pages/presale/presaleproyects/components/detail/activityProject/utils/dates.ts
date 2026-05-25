export function toDateSafeInput(s?: string | Date) {
  if (!s) return new Date();
  if (s instanceof Date) return s;
  return new Date(s.includes("T") ? s : s.replace(" ", "T"));
}
export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
export function inSameWeek(d: Date, now: Date) {
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
export function inSameMonth(d: Date, now: Date) {
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}