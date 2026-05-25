import type { ProfilesSeattingUpate, ProfilesSeattingView } from "@/application";
import { fetchUsersSettingById, updatSettingUsers } from "@/infrastructure";
import type { GlobalResponse } from "@/sharedKernel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const qkUsersSetting = {
  all: ["users-setting"] as const,
  byId: (id: number | string) => [...qkUsersSetting.all, "by-id", id] as const,
};

export function useUsersSetting() {
  return useQuery<ProfilesSeattingView>({
    queryKey: qkUsersSetting.byId("me"),
    queryFn: fetchUsersSettingById,
  });
}

export function useUsersSettingUpdate() {
  const qc = useQueryClient();
  return useMutation<GlobalResponse, unknown, ProfilesSeattingUpate>({
    mutationFn: updatSettingUsers,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qkUsersSetting.byId("me") });
    },
  });
}
