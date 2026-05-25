// src/infrastructure/company.api.ts
import type { CompanyRaw } from "@/core/entities/company.entities";

import { adaptCompany } from "@adapters/company.adapter";
import type { BusinessViewDto } from "@dtos/company/company.dto";
import http from "@infrastructure/http/httpClient";

export async function fetchCompanyView(
  businessId?: number
): Promise<BusinessViewDto> {
  if (!businessId) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<unknown>("/Business/BusinessView", {
    params: { BusinessId: businessId },
  });

  const raw: CompanyRaw = Array.isArray(data)
    ? (data[0] as CompanyRaw)
    : (data as CompanyRaw);
  if (!raw) throw new Error("No se encontró la empresa.");
  return adaptCompany(raw);
}
