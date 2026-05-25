import { FilePlus2, FileText, FolderOpen } from "lucide-react";

import type { PurchaseOrderGetByIdResponse } from "@/application";

import { detailDate } from "./purchaseOrderDetailView.helpers";

export function PurchaseOrderDocumentsCard({
  order,
}: {
  order: PurchaseOrderGetByIdResponse;
}) {
  const documents = [
    order.supplierQuotationReferenceNumber
      ? {
          label: "Cotización proveedor",
          value: order.supplierQuotationReferenceNumber,
          meta: "Referencia registrada",
        }
      : null,
    ...(order.invoices ?? []).map((invoice) => ({
      label: "Factura proveedor",
      value: invoice.supplierInvoiceNumber,
      meta: `${detailDate(invoice.supplierInvoiceDate)} · ${invoice.supplierInvoiceTotal ?? ""}`,
    })),
  ].filter(Boolean) as { label: string; value: string | number; meta: string }[];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 p-1.5 text-slate-600">
            <FolderOpen className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Documentos relacionados</h2>
            <p className="text-xs text-slate-500">Cotizaciones, facturas y sustento de recepción.</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-primary transition hover:bg-orange-50"
        >
          <FilePlus2 className="size-4" aria-hidden="true" />
          Adjuntar documento
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <FileText className="mx-auto mb-2 size-8 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">Sin documentos relacionados</p>
          <p className="mt-1 text-xs text-slate-500">
            Aún no se registraron cotizaciones, guías, facturas o recepciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {documents.map((document, index) => (
            <div key={`${document.label}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{document.label}</p>
                <p className="truncate text-xs text-slate-500">{document.value}</p>
                <p className="text-[11px] text-slate-400">{document.meta}</p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ver
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

