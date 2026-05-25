import { Wrench } from "lucide-react";
import { Card } from "../../../components/CartQt";
export type HeaderField = {
  label: string;
  view?: React.ReactNode;
  edit?: React.ReactNode;
};

type Props = {
  mode: "view" | "edit";
  fields: HeaderField[];
  right?: React.ReactNode;
};

function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <div className="text-[11px] font-medium text-zinc-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
        {children ?? "—"}
      </div>
    </div>
  );
}

export function HeaderInfoCard({ mode, fields, right }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-1">
      <Card
        title="Datos de cabecera"
        subtitle="Campos típicos"
        right={right ?? <Wrench className="h-4 w-4 text-zinc-400" />}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {fields.map((f) => (
            <Field key={f.label} label={f.label}>
              {mode === "edit" ? f.edit : f.view}
            </Field>
          ))}
        </div>
      </Card>
    </div>
  );
}