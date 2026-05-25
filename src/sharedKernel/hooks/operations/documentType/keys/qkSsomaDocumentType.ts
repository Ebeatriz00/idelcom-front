export const qkSsomaDocumentType = {
  all: ["ssoma-document-type"] as const,
  lists: () => [...qkSsomaDocumentType.all, "list"] as const,
  list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkSsomaDocumentType.lists(), pageIndex, pageSize, search ?? ""] as const,

  selects: () => [...qkSsomaDocumentType.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkSsomaDocumentType.selects(), page, search ?? "", pageSize] as const,

  byId: (id: number) => [...qkSsomaDocumentType.all, "by-id", id] as const,
};