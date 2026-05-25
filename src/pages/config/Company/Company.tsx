import { useCompanyView } from "@/sharedKernel/hooks/useCompanyView";
import { Badge } from "@/layouts/presentation/badge";
import { Card } from "@/layouts/presentation/cards/card";
import { Item } from "@/layouts/presentation/item";
import {
    BadgePercent,
  Building2,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Signature,
  Star,
} from "lucide-react";
import { Li } from "@/layouts/presentation/li";
import { Flag } from "@/layouts/presentation/flag";

export default function Company() {
  const { company, loading, error } = useCompanyView();

  if (loading) return <p>Cargando empresa...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!company) return <p>No se encontró la empresa.</p>;
  return (
    <div className="min-h-[80vh]">
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-gray-200">
        <div className="h-28 bg-gradient-to-r from-gray-900 to-gray-700" />
        <div className="px-4 sm:px-6 -mt-10 pb-4">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <div className="size-16 rounded-2xl bg-white ring-4 ring-white flex items-center justify-center shadow overflow-hidden">
                {company.logoUrl ? (
                  
                  <img
                    src={company.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="size-7 text-gray-900" />
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  {company.razonSocial}
                </h1>
                <p className="text-sm text-gray-400"></p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge ok icon={<ShieldCheck className="size-3" />}>
                    verificada
                  </Badge>
                  {company.verificada && (
                    <Badge ok icon={<Star className="size-3" />}>
                      Empresa principal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 pb-1 pr-1">
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <Globe className="size-4" /> Sitio web
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 space-y-4">
          <Card title="Acerca de la empresa">
            <p className="text-sm leading-relaxed text-gray-800">
              {company.resumen}
            </p>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <Item label="Razón social" value={company.razonSocial} />
              <Item label="RUC" value={company.ruc} mono />
            </dl>
          </Card>
          <Card title="Sedes y direcciones">
            <ul className="divide-y divide-gray-100">
              {company.direcciones.map((d) => (
                <li key={`${d.etiqueta}-${d.direccion}`} className="py-3">
                  <div className="flex items-start gap-3 text-sm text-gray-800">
                    <span className="mt-0.5 text-gray-500">
                      <MapPin className="size-4" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {d.etiqueta}
                      </div>
                      <div>{d.direccion}</div>
                      <div className="text-gray-600 text-xs">
                        {d.distrito}, {d.provincia}, {d.departamento}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
        <aside className="space-y-4">
          {/* Contacto */}
          <Card title="Contacto">
            <ul className="space-y-3 text-sm">
              <Li icon={<Mail className="size-4" />}>{company.email}</Li>
              <Li icon={<Phone className="size-4" />}>{company.telefono}</Li>
              <Li icon={<Globe className="size-4" />}>
                <a
                  className="hover:underline"
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {company.website}
                </a>
              </Li>
            </ul>
          </Card>
          {/* Identidad corporativa */}
          <Card title="Identidad">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="size-5 text-gray-500" />
                )}
              </div>
              <div className="text-sm text-gray-700">
                <div className="font-medium">{company.nombreComercial}</div>
                <div className="text-xs text-gray-500">
                  {company.razonSocial}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <div className="mb-1 text-gray-600">Firma del gerente</div>
              <div className="flex items-center gap-3">
                <div className="h-14 w-28 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {company.representanteLegal.firmaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.representanteLegal.firmaUrl}
                      alt="Firma"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Signature className="size-5 text-gray-500" />
                  )}
                </div>
                <div className="text-gray-700">
                  <div className="font-medium">
                    {company.representanteLegal.nombre}
                  </div>
                  <div className="text-xs text-gray-500">Gerente General</div>
                </div>
              </div>
            </div>
          </Card>
          {/* Tributario */}
          <Card title="Información tributaria">
            <div className="flex flex-wrap gap-2 text-xs">
              <Flag
                ok={company.tributario.pricos}
                icon={<ShieldCheck className="size-3" />}
              >
                PRICOS
              </Flag>
              <Flag
                ok={company.tributario.agenteRetencion}
                icon={<BadgePercent className="size-3" />}
              >
                Agente de retención
              </Flag>
              <Flag
                ok={company.tributario.agentePercepcion}
                icon={<BadgePercent className="size-3" />}
              >
                Agente de percepción
              </Flag>
              <Flag
                ok={company.esEmpresaPrincipal}
                icon={<Star className="size-3" />}
              >
                Empresa principal
              </Flag>
            </div>
            
          </Card>
        </aside>
      </div>
    </div>
  );
}
