import type {
  ClientActivityCreateDto,
  ClientActivityDeleteDto,
  ClientActivityResponseDto,
  ClientActivityUpdateDto,
  ClientDashboardDto,
  ClientsByIdDto,
  ClientsHistoryResponseDto,
  ClientsResponseDto,
  ClientsStatusDto,
  ClientsUpdateChangeSalesDto,
  ClientsUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchClientsList(
  page: number,
  pageSize: number,
  search: string,
  usersBy?: number,
  includeOthers?: boolean
): Promise<Paginated<ClientsResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<ClientsResponseDto>> | Paginated<ClientsResponseDto>
    >("/Clients/ClientsList", {
      params: {
        businessId: bid,
        search,
        page,
        pageSize,
        usersBy,
        includeOthers,
      },
    });
    return unwrap<Paginated<ClientsResponseDto>>(data);
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

export async function fetchClientsListHistory(
  clientsId?: number
): Promise<ClientsHistoryResponseDto[]> {
  try {
    const { data } = await http.get<ClientsHistoryResponseDto[]>(
      "/Clients/ClientsListHistory",
      {
        params: { clientsId: clientsId },
      }
    );

    return data ?? [];
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}
export async function fetchClientsSelect(
  page: number,
  search: string,
  pageSize: number,
  usersBy?: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Clients/ClientsSelect", {
    params: { businessId: bid, search, page, pageSize, usersBy },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchClientsById(
  ClientsId: number
): Promise<ClientsByIdDto> {
  const { data } = await http.get<ApiEnvelope<ClientsByIdDto> | ClientsByIdDto>(
    "/Clients/ClientsIdList",
    {
      params: { clientsId: ClientsId },
    }
  );

  return unwrap<ClientsByIdDto>(data);
}

type ClientsCreateDto = Omit<ClientsUpsertDto, "ClientsId">;
export async function createClients(
  dto: ClientsCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>("/Clients/ClientsCreate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updateClients(
  dto: ClientsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Clients/ClientsUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
export async function updateClientsChangeSales(
  dto: ClientsUpdateChangeSalesDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Clients/ClientsUpdateChangeSales",
    {
      ...dto,
      businessId,
      usersBy,
    }
  );
  return data;
}

export async function updateClientsStatus(
  dto: ClientsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Clients/ClientsStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function fetchExistsContacts(clientsId: number): Promise<boolean> {
  try {
    const response = await http.get<boolean>("/Clients/ExistsContacts", {
      params: { clientsId },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking contacts:", error);
    return false;
  }
}

export async function fetchClientDetail(
  clientsId: number
): Promise<ClientDashboardDto | null> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<ClientDashboardDto> | ClientDashboardDto
    >("/Clients/ClientsDetail", {
      params: { 
        clientsId: clientsId, 
        businessId: bid 
      },
    });

    return unwrap<ClientDashboardDto>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function fetchClientsActivityList(
  clientsId: number,
  page: number,
  pageSize: number
): Promise<Paginated<ClientActivityResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<ClientActivityResponseDto>> | Paginated<ClientActivityResponseDto>
    >("/ClientsActivity/ActivityList", {
      params: {
        business_id: bid,
        clients_id: clientsId,
        page,
        pageSize,
      },
    });

    return unwrap<Paginated<ClientActivityResponseDto>>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        totalPages: 0,
        page,
        pageSize,
      };
    }
    throw err;
  }
}

type ActivityCreateInput = Omit<ClientActivityCreateDto, "businessId" | "usersBy">;

export async function createClientsActivity(
  dto: ActivityCreateInput
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: ClientActivityCreateDto = {
    ...dto,
    businessId,
    usersBy: Number(usersBy), 
  };

  const { data } = await http.post<GlobalResponse>(
    "/ClientsActivity/ActivityCreate",
    payload
  );
  return data;
}

export async function deleteClientsActivity(
  clientsActivityId: number
): Promise<GlobalResponse> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("Empresa no disponible.");
  const payload: ClientActivityDeleteDto = {
    clientsActivityId,
    businessId,
  };

  const { data } = await http.delete<GlobalResponse>(
    "/ClientsActivity/ActivityDelete",
    {
      data: payload,
    }
  );
  return data;
}

type ActivityStatusInput = Omit<ClientActivityUpdateDto, "businessId" | "usersBy">;

export async function updateClientsActivityStatus(
  dto: ActivityStatusInput
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload: ClientActivityUpdateDto = {
    ...dto,
    businessId,
    usersBy: Number(usersBy),
  };

  const { data } = await http.patch<GlobalResponse>(
    "/ClientsActivity/ActivityStatus",
    payload
  );
  return data;
}