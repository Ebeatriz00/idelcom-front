import type { OptionItem, PagedSelect, Paginated } from "@/application";
import type {
  ExercisesBlockToggleDto,
  ExercisesResponseDto,
  ExercisesStatusDto,
  ExercisesUpsertDto,
  PeriodsBlockToggleDto,
  PeriodsResponseDto,
  PeriodsStatusDto,
  PeriodsUpsertDto,
} from "@/application/dtos/accounting/exerper/ExerPer.dto.ts";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import {
  getBusinessIdFromStorage,
  getUserIdFromtStorage,
} from "@/stores/auth/storage";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchExercisesList(
  search: string,
  page: number,
  pageSize: number,
  usersBy?: number,
): Promise<Paginated<ExercisesResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<ExercisesResponseDto>>
      | Paginated<ExercisesResponseDto>
    >("/Exercises/ExercisesList", {
      params: { search: search, business_id: bid, page, pageSize, usersBy },
    });

    return unwrap<Paginated<ExercisesResponseDto>>(data);
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

export async function fetchPeriodsList(
  exercisesId: number,
  page: number,
  pageSize: number,
): Promise<Paginated<PeriodsResponseDto>> {
  const bid = getBusinessIdFromStorage();

  if (exercisesId == null) throw new Error("Ejercicio no disponible.");
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<PeriodsResponseDto>> | Paginated<PeriodsResponseDto>
    >("/Periods/PeriodsList", {
      params: { exercises_id: exercisesId, business_id: bid, page, pageSize },
    });

    return unwrap<Paginated<PeriodsResponseDto>>(data);
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

export async function fetchExercisesSelect(
  page: number,
  search: string,
  pageSize: number,
): Promise<PagedSelect<OptionItem>> {
  const bid = getBusinessIdFromStorage();

  if (bid == null) throw new Error("BusinessId no disponible.");

  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Exercises/ExercisesSelect", {
    params: { business_id: bid, search, page, pageSize },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchPeriodById(
  periodsId: number,
): Promise<PeriodsResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<PeriodsResponseDto> | PeriodsResponseDto
  >("/Periods/PeriodsById", {
    params: { periodsId: periodsId },
  });

  return unwrap<PeriodsResponseDto>(data);
}

export async function createPeriod(
  dto: PeriodsUpsertDto,
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload: PeriodsUpsertDto & { businessId: number; usersBy: string } = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/Periods/PeriodsCreate",
    payload,
  );

  return data;
}

export async function updatePeriod(
  dto: PeriodsUpsertDto,
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Periods/PeriodsUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updatePeriodStatus(
  dto: PeriodsStatusDto, //
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Periods/PeriodsStatus", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function updatePeriodsBlock(
  dto: PeriodsBlockToggleDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>("/Periods/PeriodsBlock", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}

export async function createExercises(
  dto: Omit<ExercisesUpsertDto, "exercisesId">,
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");

  const payload = {
    ...dto,
    businessId: businessId,
    usersBy: usersBy,
  };

  const { data } = await http.post<GlobalResponse>(
    "/Exercises/ExercisesCreate",
    payload,
  );
  return data;
}

export async function createBulkPeriods(
  dtoList: Omit<PeriodsUpsertDto, "periodsId">[],
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (!usersBy) throw new Error("Usuario no disponible.");
  if (!businessId) throw new Error("Empresa no disponible.");
  const payload = dtoList.map((dto) => ({
    ...dto,
    businessId: businessId,
    usersBy: usersBy,
    indBlock: true,
  }));

  const { data } = await http.post<GlobalResponse>(
    "/Periods/PeriodsCreateBulk",
    payload,
  );

  return data;
}

export async function updateExercises(
  dto: ExercisesUpsertDto,
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/Exercises/ExercisesUpdate",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function updateExercisesStatus(
  dto: ExercisesStatusDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Exercises/ExercisesStatus",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function updateExercisesBlock(
  dto: ExercisesBlockToggleDto,
): Promise<GlobalResponse> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.patch<GlobalResponse>(
    "/Exercises/ExercisesBlock",
    { ...dto, businessId, usersBy },
  );
  return data;
}

export async function fetchExercisesById(
  exercisesId: number,
): Promise<ExercisesResponseDto> {
  const { data } = await http.get<
    ApiEnvelope<ExercisesResponseDto> | ExercisesResponseDto
  >("/Exercises/ExercisesById", {
    params: { exercisesId: exercisesId },
  });

  return unwrap<ExercisesResponseDto>(data);
}
