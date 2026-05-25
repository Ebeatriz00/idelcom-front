import type {
  Paginated,
  QuotationExcelValidationResponse,
  QuotationDetailDto,
  SalesQuotationResponse,
  SalesQuotationVerResponse,
} from "@/application";
import http from "@/infrastructure";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return ((payload as any)?.data as T) ?? (payload as T);
}

export async function fetchQuotationList(
  page: number,
  pageSize: number,
  search: string,
  workerId?: number,
  verDesc?: string
): Promise<Paginated<SalesQuotationResponse>> {
  const bid = getBusinessIdFromStorage();
  const uid = getUserIdFromtStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  if (uid == null) throw new Error("usersId no disponible.");
  const params: any = {
    businessId: bid,
    usersId: uid,
    search,
    page,
    pageSize,
    workerId,
    verDesc,
  };

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<SalesQuotationResponse>>
      | Paginated<SalesQuotationResponse>
    >("/Quotation/QuotationList", {
      params,
    });
    return unwrap<Paginated<SalesQuotationResponse>>(data);
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

export async function fetchQuotationVerList(
  quotationId: string,
  page: number,
  pageSize: number,
  search: string,
  workerId?: number,
  workerResponsibles?: number,
  verDesc?: string
): Promise<Paginated<SalesQuotationVerResponse>> {
  const bid = getBusinessIdFromStorage();
  if (bid == null) throw new Error("BusinessId no disponible.");
  const params: any = {
    quotationId,
    businessId: bid,
    search,
    page,
    pageSize,
    verDesc,
    workerId,
    workerResponsibles,
  };

  try {
    const { data } = await http.get<
      | ApiEnvelope<Paginated<SalesQuotationVerResponse>>
      | Paginated<SalesQuotationVerResponse>
    >("/Quotation/QuotationVerList", {
      params,
    });
    return unwrap<Paginated<SalesQuotationVerResponse>>(data);
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

//Detalle
export async function fetchQuotationDetail(
  quotationVerId: string,
  versionNo?: string
): Promise<QuotationDetailDto> {
  const businessId = getBusinessIdFromStorage();
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<
    ApiEnvelope<QuotationDetailDto> | QuotationDetailDto
  >("/Quotation/QuotationDetail", {
    params: {
      quotationVerId: quotationVerId,
      businessId: businessId,
      versionNo: versionNo,
    },
  });
  return unwrap<QuotationDetailDto>(data);
}

export async function validateQuotationExcel(
  file: File
): Promise<QuotationExcelValidationResponse> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post<QuotationExcelValidationResponse>(
    "/Quotation/validate-excel",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}
