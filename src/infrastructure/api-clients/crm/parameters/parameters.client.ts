import type {
  CommercialParametersResponseDto,
  CommercialParametersStatusDto,
  CommercialParametersUpsertDto,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export type ViabilityLimits = {
  max: number | null;
  min: number | null;
};

const VIAB_LIMIT_PARAM_NAME = "VIABILIDAD LIMITE";
const viabLimitKey = (bid: number) => `comm:viab-limit:${bid}`;
const viabLimitMinKey = (bid: number) => `comm:viab-limit-min:${bid}`;

export async function fetchViabilityLimit(): Promise<ViabilityLimits> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const cachedMaxStr = localStorage.getItem(viabLimitKey(bid));
  const cachedMinStr = localStorage.getItem(viabLimitMinKey(bid));

  let cachedMax: number | null = null;
  let cachedMin: number | null = null;

  if (cachedMaxStr != null) {
    const parsed = Number(cachedMaxStr);
    if (!Number.isNaN(parsed)) cachedMax = parsed;
  }
  if (cachedMinStr != null) {
    const parsed = Number(cachedMinStr);
    if (!Number.isNaN(parsed)) cachedMin = parsed;
  }

  const { data } = await http.get<
    | ApiEnvelope<Paginated<CommercialParametersResponseDto>>
    | Paginated<CommercialParametersResponseDto>
  >("/CommercialParameters/CommercialParametersList", {
    params: {
      businessId: bid,
      search: "VIABILIDAD",
      page: 1,
      pageSize: 50,
      usersBy: null,
    },
  });

  const unwrapped = unwrap<Paginated<CommercialParametersResponseDto>>(data);

  const param = unwrapped.items.find(
    (p) => p.parametersName === VIAB_LIMIT_PARAM_NAME
  );

  const apiMax =
    param?.parametersValue != null ? Number(param.parametersValue) : null;
  const apiMin = param?.minValue != null ? Number(param.minValue) : null;

  // Guardar lo que venga bien del API
  if (apiMax != null && !Number.isNaN(apiMax)) {
    localStorage.setItem(viabLimitKey(bid), String(apiMax));
  }
  if (apiMin != null && !Number.isNaN(apiMin)) {
    localStorage.setItem(viabLimitMinKey(bid), String(apiMin));
  }

  return {
    max: apiMax ?? cachedMax,
    min: apiMin ?? cachedMin,
  };
}

export async function fetchCommercialParametersList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<CommercialParametersResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<CommercialParametersResponseDto>>
      | Paginated<CommercialParametersResponseDto>
    >("/CommercialParameters/CommercialParametersList", {
      params: { businessId: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<CommercialParametersResponseDto>>(data);
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

export async function fetchCommercialParametersById(
  CommercialParametersId: number
): Promise<CommercialParametersResponseDto> {
  const { data } = await http.get<
    | ApiEnvelope<CommercialParametersResponseDto>
    | CommercialParametersResponseDto
  >("/CommercialParameters/CommercialParametersById", {
    params: { CommercialParametersId: CommercialParametersId },
  });

  return unwrap<CommercialParametersResponseDto>(data);
}

type CommercialParametersCreateDto = Omit<
  CommercialParametersUpsertDto,
  "commercialParametersId"
>;
export async function createCommercialParameters(
  dto: CommercialParametersCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/CommercialParameters/CommercialParametersCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateCommercialParameters(
  dto: CommercialParametersUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/CommercialParameters/CommercialParametersUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateCommercialParametersStatus(
  dto: CommercialParametersStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/CommercialParameters/CommercialParametersStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
