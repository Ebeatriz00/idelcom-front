import type {
  OptionItem,
  PagedSelect,
  Paginated,
  QualificationsResponseDto,
  QualificationsStatusDto,
  QualificationsUpsertDto,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchQualificationsList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number
): Promise<Paginated<QualificationsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<QualificationsResponseDto>>
      | Paginated<QualificationsResponseDto>
    >("/LeadsQualifications/LeadsQualificationsList", {
      params: { business_id: bid, search, page, pageSize, usersBy },
    });
    return unwrap<Paginated<QualificationsResponseDto>>(data);
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

export async function fetchQualificationsSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/LeadsQualifications/LeadsQualificationsSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchQualificationsById(
  leadsQualificationsId: number
): Promise<QualificationsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<QualificationsResponseDto> | QualificationsResponseDto
  >("/LeadsQualifications/LeadsQualificationsIdList", {
    // Endpoint actualizado
    params: { leadsQualificationsId: leadsQualificationsId }, // Parámetro actualizado
  });

  return unwrap<QualificationsResponseDto>(data);
}

type QualificationsCreateDto = Omit<
  QualificationsUpsertDto,
  "qualificationsId"
>;
export async function createQualifications(
  dto: QualificationsCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/LeadsQualifications/LeadsQualificationsCreate", // Endpoint actualizado
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateQualifications(
  dto: QualificationsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/LeadsQualifications/LeadsQualificationsUpdate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function updateQualificationsStatus(
  dto: QualificationsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/LeadsQualifications/LeadsQualificationsStatus",
    { ...dto, businessId, usersBy }
  );
  return data;
}
