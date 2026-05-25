import * as Lucide from "lucide-react";
import type { ComponentType } from "react";

const normalize = (k?: string | null) =>
  (k ?? "")
    .toString()
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

const index: Record<
  string,
  ComponentType<{ className?: string }>
> = Object.entries(Lucide).reduce((acc, [exportName, Cmp]) => {
  acc[exportName.toLowerCase()] = Cmp as any;
  return acc;
}, {} as Record<string, ComponentType<{ className?: string }>>);

const Fallback = Lucide.HelpCircle;

export function resolveIcon(iconKey?: string | null) {
  const key = normalize(iconKey);
  if (!key) return Fallback;
  if (index[key]) return index[key];
  const guesses = [
    key,
    key + "icon",
    key + "outline",
    key + "circle",
    key + "square",
  ];
  for (const g of guesses) {
    if (index[g]) return index[g];
  }

  const aliases: Record<string, string> = {
    proveedores: "users",
    solicitudes: "inbox",
    pedidosdecompra: "shoppingcart",
    aprobaciones: "checkcircle",
    tipodecomprobante: "filetext",
    seriescontables: "hash",
    centrosdecostos: "building2",
    conceptos: "list",
    gruposdeconceptos: "layers",
    plandecuentas: "notebook",
    cuentas: "folder",
  };
  const alias = aliases[key];
  if (alias && index[alias]) return index[alias];

  return Fallback;
}
