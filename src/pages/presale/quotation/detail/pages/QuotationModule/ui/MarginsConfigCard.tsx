import { Percent } from "lucide-react";
import { Card } from "../../../components/CartQt";

export type MarginRowUI = {
  key: string;
  typeField: React.ReactNode; // select (SearchSelect)
  rateField: React.ReactNode; // input number
  actions?: React.ReactNode; // delete
};

type Props = {
  mode: "view" | "edit";
  rows: MarginRowUI[];
  right?: React.ReactNode;
  onAdd?: () => void;
};

export function MarginsConfigCard({ mode, rows, right, onAdd }: Props) {
  return (
    <Card
      title="Margenes"
      right={right ?? <Percent className="h-4 w-4 text-zinc-400" />}
    >
      {mode === "edit" && onAdd ? (
        <div className="mb-3 flex justify-end">
          {/*<button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>*/}
        </div>
      ) : null}

      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 p-3 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-7">
              <div className="text-[11px] font-medium text-zinc-600">Tipo</div>
              <div className="mt-1">{r.typeField}</div>
            </div>

            <div className="md:col-span-3">
              <div className="text-[11px] font-medium text-zinc-600">
                Porcentaje
              </div>
              <div className="mt-1">{r.rateField}</div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              {r.actions ?? null}
            </div>
          </div>
        ))}

        {!rows.length ? (
          <div className="rounded-xl border border-zinc-200 p-3 text-xs text-zinc-500">
            Sin márgenes configurados.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
