import http from "@/infrastructure/http/httpClient";
import type { SsomaRoleSelectDto } from "@/application/dtos/ssoma/ssomaRole.dto";
import type { Paginated } from "@/application";

export async function fetchSsomaRoleSelect(
    page: number = 1,
    pageSize: number = 100,
    search?: string
): Promise<Paginated<SsomaRoleSelectDto>> {
    const { data } = await http.get<Paginated<SsomaRoleSelectDto>>(
        "/SsomaRole/GetSelect",
        {
            params: { page, pageSize, search },
        }
    );
    return data;
}
