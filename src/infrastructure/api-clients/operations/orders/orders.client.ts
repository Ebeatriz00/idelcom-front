import type { Paginated } from "@/application";
import type {
  CreateProjectManager,
  CreateQualitySupervisor,
  OrdersResponseDto,
  RegisterSsoma,
} from "@/application/dtos/operations/orders/orders.dto";
import http from "@/infrastructure/http/httpClient";
import { getBusinessIdFromStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };
function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchOrdersList(
  search: string,
  responsibleStaffId: number | null,
  page: number,
  pageSize: number,
): Promise<Paginated<OrdersResponseDto>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<
      ApiEnvelope<Paginated<OrdersResponseDto>> | Paginated<OrdersResponseDto>
    >("/Orders/OrdersList", {
      params: {
        businessId: bid,
        search,
        responsibleStaff: responsibleStaffId,
        page,
        pageSize,
      },
    });
    return unwrap<Paginated<OrdersResponseDto>>(data);
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

export async function RegisterOrderSsoma(
  payload: Omit<RegisterSsoma, "businessId">,
): Promise<boolean> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const finalPayload: RegisterSsoma = {
    ...payload,
    businessId: Number(bid),
  };

  try {
    const { data } = await http.put<any>("/Orders/RegisterSsoma", finalPayload);
    const status = data?.Status ?? data?.status;

    return status === 1;
  } catch (err: any) {
    console.error("Error al actualizar SSOMA:", err);
    throw err;
  }
}

export async function RegisterOrderProjectManager(
  payload: Omit<CreateProjectManager, "businessId">,
): Promise<boolean> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const finalPayload: CreateProjectManager = {
    ...payload,
    businessId: Number(bid),
  };

  try {
    const { data } = await http.put<any>(
      "/Orders/RegisterProjectManager",
      finalPayload,
    );
    const status = data?.Status ?? data?.status;

    return status === 1;
  } catch (err: any) {
    console.error("Error al actualizar el Gerente de Proyecto:", err);
    throw err;
  }
}

export async function RegisterOrderQualitySupervisor(
  payload: Omit<CreateQualitySupervisor, "businessId">,
): Promise<boolean> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");

  const finalPayload: CreateQualitySupervisor = {
    ...payload,
    businessId: Number(bid),
  };

  try {
    const { data } = await http.put<any>(
      "/Orders/RegisterQualitySupervisor",
      finalPayload,
    );
    const status = data?.Status ?? data?.status;

    return status === 1;
  } catch (err: any) {
    console.error("Error al actualizar el Supervisor de Calidad:", err);
    throw err;
  }
}
