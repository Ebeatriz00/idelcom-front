export const qkOpportunities = {
  all: ["Opportunities-crm"] as const,
  lists: () => [...qkOpportunities.all, "list"] as const,

  list: (
    pageIndex: number,
    pageSize: number,
    search: string,
    usersKey: string,
    stateId?: number,
    filterStartDate?: Date,
    filterFinishDate?: Date,
    filterYear?: number,
  ) =>
    [
      ...qkOpportunities.lists(),
      pageIndex,
      pageSize,
      search,
      usersKey,
      stateId,
      filterStartDate,
      filterFinishDate,
      filterYear,
    ] as const,

  selects: () => [...qkOpportunities.all, "select"] as const,

  select: (page: number, search: string, pageSize: number) =>
    [...qkOpportunities.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number | string) =>
    [...qkOpportunities.all, "by-id", String(id)] as const,

  clientsById: (id: number | string) =>
    [...qkOpportunities.all, "clients-by-id", String(id)] as const,

  stateById: (id: number | string) =>
    [...qkOpportunities.all, "state-by-id", String(id)] as const,

  detailById: (id: string, usersKey: string = "all") =>
    [...qkOpportunities.all, "detail-by-id", id, usersKey] as const,

  code: () => [...qkOpportunities.all, "next-code"] as const,

  selectsHiring: () => [...qkOpportunities.all, "select-hiring"] as const,

  selectHiring: (page: number, search: string, pageSize: number) =>
    [...qkOpportunities.selectsHiring(), page, search ?? "", pageSize] as const,

  selectsQuotationVerNo: () =>
    [...qkOpportunities.all, "select-quotation-version-no"] as const,

  selectQuotationVerNo: (
    page: number,
    resourceId: string,
    search: string,
    pageSize: number,
  ) =>
    [
      ...qkOpportunities.selectsQuotationVerNo(),
      page,
      resourceId,
      search ?? "",
      pageSize,
    ] as const,

  selectsFlowType: () => [...qkOpportunities.all, "select-flow-type"] as const,

  selectFlowType: (page: number, search: string, pageSize: number) =>
    [
      ...qkOpportunities.selectsFlowType(),
      page,
      search ?? "",
      pageSize,
    ] as const,
  
  selectsOppor: () => [...qkOpportunities.all, "select"] as const,

  selectOppor: (clientsId: number, page: number, search: string, pageSize: number) =>
    [...qkOpportunities.selects(), clientsId, page, search ?? "", pageSize] as const,


} as const;
