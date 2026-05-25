export const toInputDate = (d?: Date) =>
  d
    ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : "";

export const fromInputDate = (s: string): Date | undefined =>
  s ? new Date(`${s}T00:00:00`) : undefined;
