import { CardContentDetail } from "@/layouts";
import { fmtDate, stateColor } from "@/sharedKernel"; 
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { KVRow } from "../ui/kv";


export default function CardContentGeneralDetail({ data }: any) {
  const [open, setOpen] = useState(true);

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group w-full flex items-center justify-between px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
          aria-expanded={open}
          aria-controls="panel-info-general"
        >
          <h2 className="text-base font-semibold text-gray-800 tracking-tight">
            Información general
          </h2>
          <ChevronDown
            className={`size-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <div
          id="panel-info-general"
          className={`transition-all duration-300 overflow-hidden ${
            open
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-gray-100">
            
            <div className="p-5 md:p-6 bg-white">
              <KVRow k="N°" v={data.proyectNum} zebra />
              <KVRow k="Proyecto" v={data.description} zebra />
              <KVRow
                k="Sector"
                v={data.clientsSector || "-NO DEFINIDO-"}
                zebra
              />
              <KVRow k="Especialista" v={data.responsibleDescription} strong zebra />
              <KVRow
                k="Presupuesto Estimado"
                v={data.presupuestoEstimado}
                badge
                zebra
              />
              <KVRow k="F. Registro" v={fmtDate(data.createDate)} zebra />
              <KVRow k="F. Cierre" v={fmtDate(data.closeDate)} strong zebra />
              <KVRow
                k="Estado del Proyecto"
                v={data.statePreSaleDescription}
                pill={stateColor(data.statePreSaleDescription)} 
                zebra
              />
              <KVRow k="Tipo de Moneda" v={data.currencyName} zebra />
              
              {data.reasonRejection && (
                <KVRow k="Motivo" v={data.reasonRejection} strong zebra />
              )}
            </div>

            <div className="p-5 md:p-6 bg-white">
              <KVRow k="Cliente" v={data.clientsName} strong zebra />
              <KVRow k="RUC" v={data.clientsRuc} mono zebra onCopy />
              <KVRow k="Dirección" v={data.clientsAddress} truncate zebra />
              <KVRow k="Ciudad" v={data.clientsCity} zebra />
              <KVRow k="Celular (Cliente)" v={data.clientsPhone} mono zebra />
              <KVRow k="Web" v={data.clientsWeb} truncate link zebra />
              <KVRow k="Contacto" v={data.contactName} zebra />
              <KVRow k="Cargo" v={data.contactJob} zebra />
              <KVRow k="Celular (Contacto)" v={data.contactPhone} mono zebra />
              <KVRow
                k="Correo"
                v={data.contactEmail}
                truncate
                link
                zebra
                mailto
              />
              <KVRow k="Tipo" v={data.contactType} zebra pill="indigo" />
            </div>
          </div>
        </div>
      </div>
    </CardContentDetail>
  );
}