import type { NotifView, PrefeView, SettView } from "@/application";
import http from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { getBusinessIdFromStorage, getUserIdFromtStorage } from "@/stores";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchNotifById(): Promise<NotifView> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  const { data } = await http.get<ApiEnvelope<NotifView> | NotifView>(
    "/UsersPreferences/UsersNotifById",
    {
      params: { usersId: usersId, businessId: businessId },
    }
  );

  return unwrap<NotifView>(data);
}

export async function fetchPrefefById(): Promise<PrefeView> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  const { data } = await http.get<ApiEnvelope<PrefeView> | PrefeView>(
    "/UsersPreferences/UsersPrefeById",
    {
      params: { usersId: usersId, businessId: businessId },
    }
  );

  return unwrap<PrefeView>(data);
}

export async function fetchSettfById(): Promise<SettView> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  const { data } = await http.get<ApiEnvelope<SettView> | SettView>(
    "/UsersPreferences/UsersSettById",
    {
      params: { usersId: usersId, businessId: businessId },
    }
  );

  return unwrap<SettView>(data);
}

export async function updatNotifUsers(dto: NotifView): Promise<GlobalResponse> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersId == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/UsersPreferences/UsersNotifUpdate",
    { ...dto, businessId, usersId }
  );
  return data;
}

export async function updatPrefeUsers(dto: PrefeView): Promise<GlobalResponse> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersId == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/UsersPreferences/UsersPrefeUpdate",
    { ...dto, businessId, usersId }
  );
  return data;
}

export async function updatSettUsers(dto: SettView): Promise<GlobalResponse> {
  const usersId = String(getUserIdFromtStorage());
  const businessId = getBusinessIdFromStorage();

  if (usersId == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const { data } = await http.put<GlobalResponse>(
    "/UsersPreferences/UsersSettUpdate",
    { ...dto, businessId, usersId }
  );
  return data;
}
