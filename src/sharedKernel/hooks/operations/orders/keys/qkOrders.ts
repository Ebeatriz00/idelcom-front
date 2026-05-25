export const qkOrders = {
    all: ["Orders"] as const,
    lists: () => [...qkOrders.all, "list"] as const,
    list: (pageIndex: number, pageSize: number, search: string) =>
    [...qkOrders.lists(), pageIndex, pageSize, search ?? ""] as const,      
}