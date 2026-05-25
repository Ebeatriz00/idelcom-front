import type {
  Paginated,
  PurchaseOrderApproveDto,
  PurchaseOrderAttachInvoiceDto,
  PurchaseOrderCancelDto,
  PurchaseOrderCreateFromInvoiceDto,
  PurchaseOrderGetByIdResponse,
  PurchaseOrderListFilterDto,
  PurchaseOrderResponseDto,
  PurchaseOrderSendForApprovalDto,
  PurchaseOrderUpsertDto,
} from "@/application";
import http from "@/infrastructure/http/httpClient";
import type { GlobalResponse } from "@/sharedKernel";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

type PurchaseOrderCreateDto = Omit<PurchaseOrderUpsertDto, "purchaseOrderId">;
type PurchaseOrderUpdateDto = Required<
  Pick<PurchaseOrderUpsertDto, "purchaseOrderId">
> &
  Omit<PurchaseOrderUpsertDto, "purchaseOrderId">;

export async function createPurchaseOrder(
  dto: PurchaseOrderCreateDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/PurchaseOrderCreate",
    { ...dto },
  );
  return data;
}

export async function fetchPurchaseOrderList(
  filter: PurchaseOrderListFilterDto,
): Promise<Paginated<PurchaseOrderResponseDto>> {
  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<PurchaseOrderResponseDto>>
      | Paginated<PurchaseOrderResponseDto>
    >("/PurchaseOrder/GetAllPurchaseOrder", {
      params: { ...filter },
    });
    return unwrap<Paginated<PurchaseOrderResponseDto>>(data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        page: filter.pageNumber ?? 1,
        pageSize: filter.pageSize ?? 10,
      };
    }
    throw err;
  }
}

export async function fetchPurchaseOrderById(
  id: number,
): Promise<PurchaseOrderGetByIdResponse> {
  const { data } = await http.get<
    ApiEnvelope<PurchaseOrderGetByIdResponse> | PurchaseOrderGetByIdResponse
  >("/PurchaseOrder/GetByIdPurchaseOrder", {
    params: { id },
  });
  return unwrap<PurchaseOrderGetByIdResponse>(data);
}

export async function downloadPurchaseOrderPdf(id: number): Promise<Blob> {
  const { data } = await http.get<Blob>("/PurchaseOrder/PrintPdf", {
    params: { id },
    responseType: "blob",
  });
  return data;
}

export async function updatePurchaseOrder(
  dto: PurchaseOrderUpdateDto,
): Promise<GlobalResponse> {
  console.log("[PurchaseOrderUpdate] request dto", dto);
  const { data } = await http.put<GlobalResponse>(
    "/PurchaseOrder/PurchaseOrderUpdate",
    { ...dto },
  );
  console.log("[PurchaseOrderUpdate] response", data);
  return data;
}

export async function approvePurchaseOrder(
  dto: PurchaseOrderApproveDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/PurchaseOrderApprove",
    { ...dto },
  );
  return data;
}

export async function sendPurchaseOrderForApproval(
  dto: PurchaseOrderSendForApprovalDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/SendForApproval",
    { ...dto },
  );
  return data;
}

export async function cancelPurchaseOrder(
  dto: PurchaseOrderCancelDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/PurchaseOrderCancel",
    { ...dto },
  );
  return data;
}

export async function attachPurchaseOrderInvoice(
  dto: PurchaseOrderAttachInvoiceDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/AttachInvoice",
    { ...dto },
  );
  return data;
}

export async function createPurchaseOrderFromInvoice(
  dto: PurchaseOrderCreateFromInvoiceDto,
): Promise<GlobalResponse> {
  const { data } = await http.post<GlobalResponse>(
    "/PurchaseOrder/CreateFromInvoice",
    { ...dto },
  );
  return data;
}
