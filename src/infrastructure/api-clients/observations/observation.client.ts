import type { 
  ProjectObservationDto, 
  ProjectObservationListResponse, 
  UpdateObservationDateDto, 
  UpdateObservationDto 
} from "@/application/dtos/observations/Observations.dto"; 
import http from "@/infrastructure/http/httpClient";
import { type GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}
type CreateDto = Omit<ProjectObservationDto, 'obsId' | 'businessId'>;

export async function createProjectObservation(
  dto: CreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/Observations/ObservationsCreate", 
    {
      ...dto,
      businessId, 
      openedBy: usersBy.toString(),
      obsStatusId: dto.obsStatusId ?? 1
    }
  );

  return data;
}

export async function fetchProjectObservationList(
  search: string,
  projectToken: string
): Promise<ProjectObservationListResponse> {
  
  try {
    const { data } = await http.get<
      ApiEnvelope<ProjectObservationDto[]> | ProjectObservationDto[]
    >("/Observations/ObservationsList", {
      params: { 
        opporToken: projectToken 
      },
    });

    const allItems = unwrap<ProjectObservationDto[]>(data) || [];

    const filteredItems = search 
      ? allItems.filter(item => 
          item.obsReason?.toLowerCase().includes(search.toLowerCase())
        )
      : allItems;

    return {
      items: filteredItems,
      total: filteredItems.length,
      page: 1,                  
      pageSize: filteredItems.length, 
      totalPages: 1
    };

  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        totalPages: 0,
      };
    }
    throw err;
  }
}


export async function fetchProjectObservationProjectList(
  search: string,
  projectToken: string
): Promise<ProjectObservationListResponse> {
  
  try {
    const { data } = await http.get<
      ApiEnvelope<ProjectObservationDto[]> | ProjectObservationDto[]
    >("/Observations/ObservationsListProject", {
      params: { 
        opporToken: projectToken 
      },
    });

    const allItems = unwrap<ProjectObservationDto[]>(data) || [];

    const filteredItems = search 
      ? allItems.filter(item => 
          item.obsReason?.toLowerCase().includes(search.toLowerCase())
        )
      : allItems;

    return {
      items: filteredItems,
      total: filteredItems.length,
      page: 1,                  
      pageSize: filteredItems.length, 
      totalPages: 1
    };

  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        totalPages: 0,
      };
    }
    throw err;
  }
}




export async function fetchProjectObservationHiringList(
  search: string,
  projectToken: string
): Promise<ProjectObservationListResponse> {
  
  try {
    const { data } = await http.get<
      ApiEnvelope<ProjectObservationDto[]> | ProjectObservationDto[]
    >("/Observations/ObservationsListHiring", {
      params: { 
        opporToken: projectToken 
      },
    });

    const allItems = unwrap<ProjectObservationDto[]>(data) || [];

    const filteredItems = search 
      ? allItems.filter(item => 
          item.obsReason?.toLowerCase().includes(search.toLowerCase())
        )
      : allItems;

    return {
      items: filteredItems,
      total: filteredItems.length,
      page: 1,                  
      pageSize: filteredItems.length, 
      totalPages: 1
    };

  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 0,
        totalPages: 0,
      };
    }
    throw err;
  }
}

export async function updateProjectObservation(
  dto: UpdateObservationDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Observations/ObservationsUpdate", 
    {
      ...dto,
      businessId,
      usersBy: usersBy.toString(),
    }
  );
  return data;
}

export async function updateProjectObservationDate(
  dto: UpdateObservationDateDto
): Promise<GlobalResponse> {
  
  const usersBy = getUserIdFromtStorage();

  const { data } = await http.patch<GlobalResponse>(
    "/Observations/ObservationsUpdateDate", 
    {
      ...dto,
      usersBy: usersBy ? usersBy.toString() : null 
    }
  );
  return data;
}