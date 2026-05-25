import { fetchSsomaRoleSelect } from "@/infrastructure/api-clients/ssoma/ssomaRole.client";
import { useQuery } from "@tanstack/react-query";
import type { SsomaRoleSelectDto } from "@/application/dtos/ssoma/ssomaRole.dto";
import type { Paginated } from "@/application";

export const qkSsomaRole = {
  all: ["ssoma-role"] as const,
  lists: () => [...qkSsomaRole.all, "list"] as const,
  list: (page: number, pageSize: number, search?: string) =>
    [...qkSsomaRole.lists(), { page, pageSize, search }] as const,
};

export function useSsomaRoleSelect(
  page: number = 1,
  pageSize: number = 100,
  search?: string
) {
  return useQuery<Paginated<SsomaRoleSelectDto>>({
    queryKey: qkSsomaRole.list(page, pageSize, search),
    queryFn: () => fetchSsomaRoleSelect(page, pageSize, search),
  });
}
