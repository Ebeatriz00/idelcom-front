import type { OptionItem } from "@/application";


export const idToOption = (id?: number, label?: string) =>
id != null ? { value: id, label: label ?? `ID ${id}` } : null;


export const findByNumericValue = (items: OptionItem[], id?: number) =>
items.find(o => Number(o.value) === id);