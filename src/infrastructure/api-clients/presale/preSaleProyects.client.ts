import http from "@/infrastructure/http/httpClient";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

import type {
  ActivityOpporCreateDto,
  ActivityOpporDeleteDto,
  ActivityPriorityOpporDto,
  ActivityStateOpporDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import type {
  PreSaleProyectsStatusDto,
  PreSaleProyectsUpsertDto,
  ProjectsUpdateStatusDto,
} from "@/application/dtos/presale/PreSaleProyects.dto";
import type {
  FileTrackingProjectCreateDto,
  FileTrackingProjectDeleteDto,
  PreSaleProyectsDetailDto,
} from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import type { GlobalResponse } from "@/sharedKernel";
import type { ProjectCollaboratorBatchDto, } from "@/pages/presale/presaleproyects/components/ProjectCollaboratorForm";
import type { ProjectTeamResponseDto } from "@/application/dtos/presale/ProjectTeam.dto";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export interface PreSaleProjectColumnFilters {
  filterCode?: string;
  filterProject?: string;
  filterClient?: string;
  filterSeller?: string;
  filterResponsible?: string;
  filterStatePreSale?: string;
  filterStateOpportunity?: string;
  filterFinishDate?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
}

export async function fetchPreSaleProyectsList(
  page: number,
  pageSize: number,
  search: string,
  workerId?: number,
  filters?: PreSaleProjectColumnFilters, 
  usersId?: number, 
  sortBy?: string,       
  sortDirection?: string,
  opporNum?: string,
  stateId?: number,
  category?: number,
  quoDate?: string
): Promise<Paginated<PreSaleProyectsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  const actualUserId = usersId ?? getUserIdFromtStorage(); 

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<PreSaleProyectsResponseDto>>
      | Paginated<PreSaleProyectsResponseDto>
    >("/PreSaleProyects/PreSaleProyectsList", {
      params: {
        business_id: bid,
        search,
        page,
        pageSize,
        workerId,
        ...filters, 
        opporNum,
        usersId: actualUserId,
        sortBy,
        sortDirection, 
        stateId,
        category: category ?? (filters as any)?.category,
        quoDate: quoDate ?? (filters as any)?.quoDate
      },
    });
    return unwrap<Paginated<PreSaleProyectsResponseDto>>(data);
  } catch (err: any) {
    throw err;
  }
}

export async function fetchProjectTeamList(
  page: number,
  pageSize: number,
  search: string,
  projectToken?: string
): Promise<Paginated<ProjectTeamResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<ProjectTeamResponseDto>> | Paginated<ProjectTeamResponseDto>
    >("/ProjectTeam/PreSaleProyectsList", {
      params: {
        business_id: bid,
        search,
        page,
        pageSize,
        projectToken 
      },
    });
    return unwrap<Paginated<ProjectTeamResponseDto>>(data);

  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        totalPages: 0,
        page: page,
        pageSize: pageSize
      };
    }
    throw err;
  }
}

export async function fetchPreSaleProyectsSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/PreSaleProyects/PreSaleProyectsSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPreSaleProyectsById(
  linkToken: string
): Promise<PreSaleProyectsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<PreSaleProyectsResponseDto> | PreSaleProyectsResponseDto
  >("/PreSaleProyects/PreSaleProyectsById", {
    params: { linkToken: linkToken },
  });

  return unwrap<PreSaleProyectsResponseDto>(data);
}

type PreSaleProyectsCreateDto = Omit<PreSaleProyectsUpsertDto, "linkToken">;

export async function createPreSaleProyects(
  dto: PreSaleProyectsCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/PreSaleProyects/PreSaleProyectsCreate",
    { ...dto, businessId, usersBy: usersBy.toString() }
  );
  return data;
}

export async function updatePreSaleProyects(
  dto: PreSaleProyectsUpsertDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/PreSaleProyects/PreSaleProyectsUpdate",
    { ...dto, businessId, usersBy: usersBy.toString() }
  );
  return data;
}

export async function projectsUpdateState(
  dto: ProjectsUpdateStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/PreSaleProyects/ProjectsUpdateState",
    {
      ...dto,
      businessId,
      usersBy,
    }
  );
  return data;
}

export async function UpdateResponsibleProject(
  
  dto: { linkToken: string; workerId: number; projectCategory: number; }
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const {data} = await http.put<GlobalResponse>(
    "PreSaleProyects/UpdateResponsible",
    {
      linkToken: dto.linkToken, 
      workerId: dto.workerId, 
      projectCategory: dto.projectCategory,
      usersBy, 
      businessId
    }
  );
  return data;

}

export async function updatePreSaleProyectsStatus(
  dto: PreSaleProyectsStatusDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/PreSaleProyects/PreSaleProyectsStatus",
    { ...dto, businessId, usersBy: usersBy.toString() }
  );
  return data;
}

export async function fetchPreSaleProyectsDetail(
  linkToken: string
): Promise<PreSaleProyectsDetailDto> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PreSaleProyectsDetailDto> | PreSaleProyectsDetailDto
  >("/PreSaleProyects/PreSaleProyectsDetail", {
    params: {
      linkToken: linkToken,
      businessId: businessId,
    },
  });

  const unwrappedData = unwrap<PreSaleProyectsDetailDto>(data);
  if (!unwrappedData)
    throw new Error("No se encontró el detalle del proyecto.");

  return unwrappedData;
}

export async function createActivityOppor(
  dto: ActivityOpporCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const workerOwnerId = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/Activity/ActivityProjectCreate",
    { ...dto, businessId, workerOwnerId, usersBy }
  );
  return data;
}
export async function updateActivityChangeState(
  dto: ActivityStateOpporDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Activity/ActivityStateChange",
    { ...dto, businessId, usersBy }
  );
  return data;
}
export async function updateActivityChangePriorityState(
  dto: ActivityPriorityOpporDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Activity/ActivityPriorityStateChange",
    { ...dto, businessId, usersBy }
  );
  return data;
}
export async function deleteActivityOppor(
  dto: ActivityOpporDeleteDto
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/Activity/ActivityProjectDelete",
    {
      data: dto,
    }
  );

  return data;
}

export async function createFileTrackingProject(
  dto: FileTrackingProjectCreateDto
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.post<GlobalResponse>(
    "/FileTracking/FileTrackingProjectCreate",
    { ...dto, businessId, usersBy }
  );
  return data;
}

export async function deleteFileTrackingProject(
  dto: FileTrackingProjectDeleteDto
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/FileTracking/FileTrackingProjectDelete",
    {
      data: dto,
    }
  );

  return data;
}

export async function createProjectTeam(
  dto: ProjectCollaboratorBatchDto 
): Promise<GlobalResponse> {
  
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  if (dto.businessId !== businessId) {
      console.warn("El BusinessID del formulario no coincide con el de la sesión.");
  }

  const payload = {
    projectToken: dto.projectToken,
    WorkerId: dto.workersId,
    businessId: businessId, 
    usersBy: usersBy.toString(),
  };

  const { data } = await http.post<GlobalResponse>(
    "/ProjectTeam/ProjectTeamCreate", 
    payload
  );
  
  return data;
}

export async function deleteProjectTeamMember(
  dto: { projectTeamId: number; businessId: number }
): Promise<GlobalResponse> {
  const { data } = await http.delete<GlobalResponse>(
    "/ProjectTeam/ProjectTeamDelete",
    {
      data: dto
    }
  );
  return data;
}