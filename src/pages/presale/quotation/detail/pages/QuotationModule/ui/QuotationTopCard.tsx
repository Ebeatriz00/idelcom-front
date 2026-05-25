import { Boxes, HardHat } from "lucide-react";
import { Tabs } from "../../../components/TabsQt";

type Props = {
  tab: string;
  setTab: (v: string) => void;
  versionNo: number | string;
};

export function QuotationTopCard({ tab, setTab, versionNo }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            Detalle (versión {versionNo})
          </div>
          <div className="text-xs text-zinc-500">
            Padre/hijo · preventa (rojo) · negrita (group) · planes por línea ·
            cronogramas · egresos
          </div>
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "detail", label: "Detalle", icon: Boxes },
            { id: "pre_sales", label: "Preventa", icon: HardHat },
            /*{ id: "audit", label: "Auditoría", icon: History },
            { id: "comments", label: "Comentarios", icon: MessagesSquare },*/
          ]}
        />
      </div>
    </div>
  );
}
