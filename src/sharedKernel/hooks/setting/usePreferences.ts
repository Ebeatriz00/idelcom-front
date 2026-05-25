import type { NotifView, PrefeView, SettView } from "@/application";
import {
  fetchNotifById,
  fetchPrefefById,
  fetchSettfById,
  updatNotifUsers,
  updatPrefeUsers,
  updatSettUsers,
} from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel/globalResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkUsersPreferences = {
  all: ["users-preferences"] as const,
  notif: {
    all: () => ["users-preferences", "notif"] as const,
    byId: (id: number | string) =>
      ["users-preferences", "notif", "by-id", id] as const,
  },
  prefe: {
    all: () => ["users-preferences", "prefe"] as const,
    byId: (id: number | string) =>
      ["users-preferences", "prefe", "by-id", id] as const,
  },
  sett: {
    all: () => ["users-preferences", "sett"] as const,
    byId: (id: number | string) =>
      ["users-preferences", "sett", "by-id", id] as const,
  },
} as const;

export function useUsersNotif() {
  return useQuery<NotifView>({
    queryKey: qkUsersPreferences.notif.byId("me"),
    queryFn: fetchNotifById,
  });
}
export function useUsersPrefe() {
  return useQuery<PrefeView>({
    queryKey: qkUsersPreferences.prefe.byId("me"),
    queryFn: fetchPrefefById,
  });
}
export function useUsersSett() {
  return useQuery<SettView>({
    queryKey: qkUsersPreferences.sett.byId("me"),
    queryFn: fetchSettfById,
  });
}

export function useUsersNotifUpdate() {
  const qc = useQueryClient();
  return useMutation<GlobalResponse, unknown, NotifView>({
    mutationFn: updatNotifUsers,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkUsersPreferences.notif.byId("me") });
    },
  });
}

export function useUsersPrefeUpdate() {
  const qc = useQueryClient();
  return useMutation<GlobalResponse, unknown, PrefeView>({
    mutationFn: updatPrefeUsers,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkUsersPreferences.prefe.byId("me") });
    },
  });
}

export function useUsersSettUpdate() {
  const qc = useQueryClient();
  return useMutation<GlobalResponse, unknown, SettView>({
    mutationFn: updatSettUsers,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkUsersPreferences.sett.byId("me") });
    },
  });
}
