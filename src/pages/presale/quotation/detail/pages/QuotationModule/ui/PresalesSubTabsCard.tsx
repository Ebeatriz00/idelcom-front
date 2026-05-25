import { Boxes, HandCoins, Wallet } from "lucide-react";
import { Tabs } from "../../../components/TabsQt";

type Props = {
  subTab: string;
  setSubTab: (v: string) => void;
  versionNo: number | string;
};

export function PresalesSubTabsCard({ subTab, setSubTab, versionNo }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            Detalle Preventa (versión {versionNo})
          </div>
        </div>

        <Tabs
          value={subTab}
          onChange={setSubTab}
          items={[
            { id: "detail_presales", label: "Detalle", icon: Boxes },
            { id: "payments", label: "Plan de pago", icon: HandCoins },
            { id: "egress", label: "Egresos", icon: Wallet },
          ]}
        />
      </div>
    </div>
  );
}
