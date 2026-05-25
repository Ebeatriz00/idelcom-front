import { ShieldCheck } from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import { detailDate, detailValue } from "./purchaseOrderDetailView.helpers";

function AuditItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{detailValue(value)}</p>
    </div>
  );
}

export function PurchaseOrderAuditCard({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-slate-100 p-1.5 text-slate-600">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Auditoría</h2>
          <p className="text-xs text-slate-500">Registro de responsables y eventos de control.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
        <AuditItem label="Creado por" value={order.requestedBy} />
        <AuditItem label="Fecha de creación" value={detailDate(order.purchaseOrderDate)} />
        <AuditItem label="Última actualización" value={null} />
        <AuditItem label="Aprobado por" value={order.approvedBy} />
        <AuditItem label="Fecha de aprobación" value={detailDate(order.approvedAt)} />
        <AuditItem label="Anulado por / motivo" value={null} />
      </div>
    </section>
  );
}

