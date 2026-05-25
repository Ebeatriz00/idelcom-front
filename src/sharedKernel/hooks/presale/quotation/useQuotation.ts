import type {
  Paginated,
  QuotationDetailDto,
  SalesQuotationResponse,
  SalesQuotationVerResponse,
} from "@/application";
import {
  fetchQuotationDetail,
  fetchQuotationList,
  fetchQuotationVerList,
} from "@/infrastructure";
import { useQuotesPerms } from "@/pages/presale/quotation/hooks/quotes.perms";
import { useAuth } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";

export const qkQuotation = {
  all: ["Quotation-presales"] as const,
  lists: () => [...qkQuotation.all, "list"] as const,

  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
    verDesc?: string
  ) =>
    [
      ...qkQuotation.lists(),
      "hdr",
      pageIndex,
      pageSize,
      search,
      usersKey,
      verDesc,
    ] as const,

  listVer: (
    quotationId: string,
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
    verDesc?: string,
    workerResponsiblesKey?: string
  ) =>
    [
      ...qkQuotation.lists(),
      "ver",
      quotationId,
      pageIndex,
      pageSize,
      search,
      usersKey,
      verDesc,
      workerResponsiblesKey,
    ] as const,
  detailById: (quotationVerId: string, versionNo: string = "all") =>
    [...qkQuotation.all, "detail", quotationVerId, versionNo] as const,
};

export function useQuotationList(
  pageIndex: number,
  pageSize: number,
  search?: string,
  verDesc?: string
) {
  const s = (search ?? "").trim();

  const { canViewAllQuotes, isLoadingPerms } = useQuotesPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;
  const usersBy: number | undefined = canViewAllQuotes
    ? undefined
    : workerId ?? undefined;
  const workerKeyPart: string = canViewAllQuotes ? "all" : workerIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewAllQuotes || !!workerId);

  return useQuery<Paginated<SalesQuotationResponse>>({
    queryKey: qkQuotation.list(pageIndex, pageSize, s, workerKeyPart, verDesc),
    queryFn: () =>
      fetchQuotationList(pageIndex + 1, pageSize, s, usersBy, verDesc),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}
export function useQuotationVerList(
  quotationId: string,
  pageIndex: number,
  pageSize: number,
  search?: string,
  verDesc?: string
) {
  const s = (search ?? "").trim();

  const { canViewAllQuotes, canViewAllResponsiblesQuotes, isLoadingPerms } =
    useQuotesPerms();

  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  // Filtro para @USERS_ID (si no puede ver todo)
  const usersBy: number | undefined = canViewAllQuotes ? undefined : workerId;

  // Filtro para @WORKER_RESPONSIBLE (si no puede ver todo por responsables)
  const usersByResp: number | undefined = canViewAllResponsiblesQuotes
    ? undefined
    : workerId;

  const usersKeyPart: string = usersBy == null ? "all" : String(usersBy);
  const responsiblesKeyPart: string =
    usersByResp == null ? "all" : String(usersByResp);

  const enabled = !isLoadingPerms && (canViewAllQuotes || !!workerId);

  return useQuery<Paginated<SalesQuotationVerResponse>>({
    queryKey: qkQuotation.listVer(
      quotationId,
      pageIndex,
      pageSize,
      s,
      usersKeyPart,
      verDesc,
      responsiblesKeyPart
    ),
    queryFn: () =>
      fetchQuotationVerList(
        quotationId,
        pageIndex + 1,
        pageSize,
        s,
        usersBy,
        usersByResp,
        verDesc
      ),
    retry: false,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled,
  });
}

export function useDetailQuotation(quotationVerId: string, versionNo: string) {
  return useQuery<QuotationDetailDto>({
    queryKey: qkQuotation.detailById(quotationVerId, versionNo),
    queryFn: () => fetchQuotationDetail(quotationVerId, versionNo),
    enabled: !!quotationVerId,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    retry: false,
  });
}
