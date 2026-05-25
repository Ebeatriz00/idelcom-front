import type { OptionItem } from "@/application";

export function parseTaxPercentage(tax?: OptionItem | null) {
  const source = `${tax?.extraInfo ?? ""} ${tax?.label ?? ""}`;
  const match = source.match(/-?\d+(?:[.,]\d+)?/);

  if (!match) return 0;

  const value = Number(match[0].replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}
