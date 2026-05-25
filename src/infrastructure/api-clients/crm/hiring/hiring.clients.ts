import type { HiringResponseDto, HiringUpdateStatusDto, Paginated } from "@/application";
import http from "@/infrastructure/http/httpClient";
import { type GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };
function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchHiringList(
  page: number,
  pageSize: number,
  search: string,
  workerId?:number,
  usersId?:number
): Promise<Paginated<HiringResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<HiringResponseDto>>
      | Paginated<HiringResponseDto>
    >("/Hiring/HiringList", {
      params: {
        businessId: bid,
        search,
        page,
        pageSize,
        workerId,
        usersId
      },
    });
    return unwrap<Paginated<HiringResponseDto>>(data);
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

type HiringInput = Omit<HiringUpdateStatusDto, 'businessId' | 'usersBy'>;

export async function updateHiringStatus(
  dto: HiringInput
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const fullDto: HiringUpdateStatusDto = {
    ...dto,       
    businessId,   
    usersBy,      
  };

  const { data } = await http.put<GlobalResponse>("/Hiring/UpdateHiringStatus", fullDto);
  return data;
}

export async function markOpportunityFilesRead(opporToken: string) {
  const businessId = getBusinessIdFromStorage();
  const usersBy = getUserIdFromtStorage(); 

  await http.post("/Hiring/MarkFilesRead", {
    businessId,
    usersBy,    
    opporToken, 
  });
}


