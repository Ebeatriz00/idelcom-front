import { cn } from "@/sharedKernel";
import { BarChart3 } from "lucide-react";
import { Badge } from "../../../components/BadgeQt";
import { Card } from "../../../components/CartQt";
import { QuotationMarginsBlock } from "../containers/QuotationMarginsBlock";
import { fmtMoney, fmtPct } from "../utils/format";

type Props = {
  data: any;
  quotationTotal: number;
  scheduleTotal: number;
  diffTotal: number;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-3">
      <div className="text-[11px] font-medium text-zinc-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export function PresalesSummaryGrid({
  data,
  quotationTotal,
  scheduleTotal,
  diffTotal,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <QuotationMarginsBlock
        data={data}
        onSave={async () => {
          // TODO: mutation save margins
          // await saveQuotationMargins({ quotationVerId: data.quotationVerId, items: payload })
        }}
      />

      <Card
        title="Resumen"
        right={<BarChart3 className="h-4 w-4 text-zinc-400" />}
      >
        <div className="grid grid-cols-2 gap-3">
          <Stat label="V.V.C" value={fmtMoney(data?.subTotal ?? 0)} />
          <Stat label="V. TOTAL" value={fmtMoney(data?.total ?? 0)} />
          <Stat label="C. TOTAL" value={fmtMoney(data?.costTotal ?? 0)} />
          <Stat label="U. TOTAL" value={fmtMoney(data?.utilityTotal ?? 0)} />
          <Stat label="M. TOTAL" value={fmtPct(data?.marginPercent ?? 0)} />
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">
              Comprobación de servicios
            </div>

            <Badge
              tone={
                diffTotal === 0
                  ? "success"
                  : Math.abs(diffTotal) < 1
                  ? "warn"
                  : "danger"
              }
            >
              {fmtMoney(diffTotal)}
            </Badge>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-zinc-200 p-2">
              <div className="text-[11px] text-zinc-600">Cotización</div>
              <div className="text-sm font-semibold">
                {fmtMoney(quotationTotal)}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-2">
              <div className="text-[11px] text-zinc-600">Cronograma</div>
              <div className="text-sm font-semibold">
                {fmtMoney(scheduleTotal)}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-2">
              <div className="text-[11px] text-zinc-600">Diferencia</div>
              <div
                className={cn(
                  "text-sm font-semibold",
                  diffTotal === 0 ? "text-emerald-700" : "text-rose-700"
                )}
              >
                {fmtMoney(diffTotal)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
