export const qkOperationsTeamSsoma = {
  all: ["operations", "operationsTeamSsoma"] as const,
  lists: () => [...qkOperationsTeamSsoma.all, "list"] as const,
  list: (ssomaProcessId: number) =>
    [...qkOperationsTeamSsoma.lists(), { ssomaProcessId }] as const,
  details: () => [...qkOperationsTeamSsoma.all, "detail"] as const,
  detail: (id: number) => [...qkOperationsTeamSsoma.details(), id] as const,
  activeAssignments: () => [...qkOperationsTeamSsoma.all, "active-assignment"] as const,
  activeAssignment: (workerId: number) =>
    [...qkOperationsTeamSsoma.activeAssignments(), workerId] as const,
};
