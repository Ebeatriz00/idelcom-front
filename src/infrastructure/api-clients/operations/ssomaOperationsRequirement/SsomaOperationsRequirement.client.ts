import type { Paginated } from "@/application";
import type { SsomaOperationsRequirementCreateDto } from "@/application/dtos/operations/ssomaOperationsRequirement/ssomaOperationsRequirement.dto";
import type { SsomaOperationsRequirementItem } from "@/application/dtos/operations/ssomaOperationsRequirement/ssomaOperationsRequirementItem.dto";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

/**
 * Obtiene el listado de requerimientos asignados a una operación.
 */
export async function fetchSsomaOperationsRequirementList(
  operationsId: number,
  page: number,
  pageSize: number,
  search?: string,
) {
  const { data } = await http.get<
    ApiEnvelope<Paginated<SsomaOperationsRequirementItem>> | Paginated<SsomaOperationsRequirementItem>
  >("/SsomaOperationsRequirement/GetAllSsomaOperationsRequirement", {
    params: { operationsId, page, pageSize, search },
  });

  return unwrap<Paginated<SsomaOperationsRequirementItem>>(data);
}

/**
 * Crea una nueva asignación de requerimiento a una operación SSOMA.
 */
export async function createSsomaOperationsRequirement(
  dto: SsomaOperationsRequirementCreateDto,
) {
  const { data } = await http.post<GlobalResponse>(
    "/SsomaOperationsRequirement/CreateSsomaOperationsRequirement",
    dto,
  );
  return data;
}

/**
 * Elimina una asignación de requerimiento de una operación.
 */
export async function deleteSsomaOperationsRequirement(
  ssomaOperationsRequirementId: number,
) {
  const { data } = await http.delete<GlobalResponse>(
    "/SsomaOperationsRequirement/DeleteSsomaOperationsRequirement",
    {
      params: { ssomaOperationsRequirementId }, // Nombre exacto del parámetro esperado por el controlador
    },
  );
  return data;
}
