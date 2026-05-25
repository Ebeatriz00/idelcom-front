import type {
  ProfilesSeattingUpate,
  ProfilesSeattingView,
} from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchUsersSettingById(): Promise<ProfilesSeattingView> {
  const usersBy = String(getUserIdFromtStorage());

  const { data } = await http.get<
    ApiEnvelope<ProfilesSeattingView> | ProfilesSeattingView
  >("/Users/UsersSettingById", {
    params: { usersId: usersBy },
  });

  return unwrap<ProfilesSeattingView>(data);
}

export async function updatSettingUsers(
  dto: ProfilesSeattingUpate
): Promise<GlobalResponse> {
  const usersBy = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>("/Users/UsersSettingUpdate", {
    ...dto,
    businessId,
    usersBy,
  });
  return data;
}
