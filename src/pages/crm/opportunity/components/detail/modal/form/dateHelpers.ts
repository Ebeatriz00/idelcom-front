export const toInputDate = (value?: Date | string | null): string => {
  if (!value) return "";

  try {
    if (typeof value === "string") {
      const dateOnly = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (dateOnly) {
        const [, year, month, day] = dateOnly;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }

    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};
export const fromInputDate = (value: string): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month - 1, day);
};
