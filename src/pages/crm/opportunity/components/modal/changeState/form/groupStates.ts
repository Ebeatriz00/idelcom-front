export const ACTION_STATES = [2, 4]; // ANALISIS,  PROPUESTA
export const RESULT_STATES = [8, 19, 10, 11, 12]; // NEGOCIACION, GANADO, STAND BY, DESCARTADO, PERDIDO
export const NEGOTATION_STATES = [17]; // OBSERVADO POR CLIENTE,STAND BY, DESCARTADO, PERDIDO
export const RE_EVALUATION = [2, 12]; // ANALISIS
export const NEGOTATION = [4]; // PROPUESTA
//export const HIDDEN_FROM_ACTION = [1, 5, 6, 7, 8, 9, 10];

export function ensureSelectedOption<T extends { value: any; label: string }>(
  options: Array<T & { disabled?: boolean }>,
  selectedValue: number,
  allItems: Array<{ value: any; label: string }>,
) {
  if (!selectedValue) return options;

  const exists = options.some((o) => Number(o.value) === selectedValue);
  if (exists) return options;

  const selected = allItems.find((x) => Number(x.value) === selectedValue);
  if (!selected) return options;

  return [
    {
      value: selected.value,
      label: selected.label,
      disabled: true,
    } as any,
    ...options,
  ];
}
