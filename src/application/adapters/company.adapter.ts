// src/application/adapters/company.adapter.ts
import type { CompanyRaw } from "@/core/entities/company.entities";
import type {  BusinessViewDto } from "@dtos/company/company.dto";

function toBool(v: string | number | boolean | null | undefined) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (v == null) return false;
  return String(v) === "1" || String(v).toLowerCase() === "true";
}

function sanitize(val?: string | null) {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === "-" || trimmed === "") return null;
  return trimmed;
}

function urlOrNull(val?: string | null) {
  const s = sanitize(val);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.href;
  } catch {
    return null;
  }
}

export function adaptCompany(raw: CompanyRaw): BusinessViewDto {
  const direcciones = (raw.addressBusiness ?? []).map(d => ({
    id: d.id,
    etiqueta: d.label,
    direccion: d.address,
    departamento: d.department,
    provincia: d.province,
    distrito: d.district,
    esPrincipal: d.mainAddress,
  }));
  
  return {
    ruc: raw.businessRuc,
    nombreComercial: raw.companyName,
    razonSocial: raw.businessName,
    resumen: raw.aboutBusiness,
    website: raw.website,

    esEmpresaPrincipal: !!raw.isMain,
    verificada: !!raw.isVerified,

    telefono: sanitize(raw.businessPhone),
    email: sanitize(raw.businessEmail),

    representanteLegal: {
      nombre: sanitize(raw.businessLegalRepre) ?? "",
      documento: sanitize(raw.legalDocument),
      firmaUrl: urlOrNull(raw.legalFirm),
    },

    tributario: {
      agenteRetencion: toBool(raw.retentionAgent),
      agentePercepcion: toBool(raw.perceptionAgent),
      pricos: toBool(raw.pricos),
      abrevDocumento: sanitize(raw.abrv) ?? "RUC",
    },

    documentos: {
      fichaRuc: urlOrNull(raw.fileRuc),
      constanciaCumplimiento: urlOrNull(raw.fileComplanceCertificate),
    },
    direcciones,
    logoUrl: urlOrNull(raw.businessLogo),
  };
}
