import { fmtMoney } from "../utils/format";

type Props = {
  subTotal: number;
  discountAmount: number;
  tax: number;
  total: number;
};

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-3">
      <div className="text-[11px] text-zinc-600">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

export function DetailTotalsBar({
  subTotal,
  discountAmount,
  tax,
  total,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <Box label="Subtotal" value={fmtMoney(subTotal ?? 0)} />
      <Box label="Descuento" value={fmtMoney(discountAmount ?? 0)} />
      <Box label="IGV" value={fmtMoney(tax ?? 0)} />
      <Box label="Total" value={fmtMoney(total ?? 0)} />
    </div>
  );
}
