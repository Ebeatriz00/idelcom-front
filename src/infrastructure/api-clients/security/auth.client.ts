import type { AuthBootstrapDto, AuthSessionDto } from "@/application";
import http from "@/infrastructure";
import { runCoordinatedAuthRefresh } from "@/infrastructure/http/refresh-session";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

export async function fetchAuthLogin(payload: any): Promise<any> {
  const { data } = await http.post("/Auth/login", payload, { timeout: 20000 });
  return data;
}

export async function fetchAuthLogout(): Promise<any> {
  const { data } = await http.post("/Auth/logout");
  return data;
}

export async function fetchAuthRefresh(): Promise<any> {
  await runCoordinatedAuthRefresh(http.defaults.baseURL);
  return undefined;
}
export async function fetchAuthBootstrap() {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();
  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.get<AuthBootstrapDto>("/Auth/bootstrap", {
    params: { usersId: usersBy, businessId: businessId },
  });
  return data;
}

export async function fetchAuthInvalidateBootstrap(
  profilesId: number
): Promise<void> {
  const businessId = getBusinessIdFromStorage();

  if (profilesId == null) throw new Error("perfil no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  await http.post("/Auth/invalidate", null, {
    params: {
      profilesId,
      businessId,
    },
  });
}

export async function fetchAuthSession(): Promise<any> {
  try {
    const { data } = await http.get<AuthSessionDto>("/Auth/session");
    return data;
  } catch (e: any) {
    // Sin response => error de red (server caído, refused, etc.)
    if (!e.response) {
      throw { isNetworkError: true, original: e };
    }
    throw e;
  }
}
