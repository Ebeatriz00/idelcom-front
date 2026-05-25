import http from "@/infrastructure/http/httpClient";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type { Paginated } from "@/application";
import type { GlobalResponse } from "@/sharedKernel";

import type {
  Viability,
  ViabilityDecision,
  ViabilityStatus,
} from "@/application/dtos/crm/viability/Viability.dto";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchViabilityList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<Viability>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<Viability>> | Paginated<Viability>
    >("/OpporViability/OpporViabilityList", {
      params: {
        businessId: bid,
        search,
        page,
        pageSize,
        usersBy,
      },
    });
    return unwrap<Paginated<Viability>>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        page,
        pageSize,
      };
    }
    throw err;
  }
}

type ViabilityStatusDto = Omit<ViabilityStatus, "businessId" | "usersBy">;

export async function updateViabilityStatus(
  dto: ViabilityStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/OpporViability/OpporViabilityStatus",
    { ...dto, businessId, usersBy: usersBy }
  );
  return data;
}

type ViabilityDecisionDto = Omit<ViabilityDecision, "businessId" | "usersBy">;

export async function processViabilityDecision(
  dto: ViabilityDecisionDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/OpporViability/ProcessDecision",
    { ...dto, businessId, usersBy: usersBy }
  );
  return data;
}