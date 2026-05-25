// hooks/useAppAuth.ts
import { useAuth as useAuthStore } from "@/stores/auth";
import { usePermissions } from "./PermissionsContext";

export function useAppAuth() {
  const auth = useAuthStore();

  let perms: ReturnType<typeof usePermissions> | null = null;
  try {
    perms = usePermissions();
  } catch {
    perms = null;
  }

  const user = auth.userId
    ? {
        id: auth.userId,
        name: auth.userName,
        email: auth.userName,
        businessId: auth.businessId,
        businessName: auth.businessName,
        profile: auth.profile,
        photo: auth.userPhoto,
      }
    : null;

  return {
    user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading,
    error: auth.error,
    locked: auth.locked,
    lockReason: auth.lockReason,

    login: auth.login,
    logout: auth.logout,
    reauth: auth.reauth,
    refreshAccessToken: auth.refreshAccessToken,

    isInitialized: perms?.isInitialized ?? false,
    setPermissions: perms?.setPermissions ?? (() => {}),
    allowedModuleCodes: perms?.allowedModuleCodes ?? [],
    effectiveList: perms?.effectiveList ?? [],
    allowedModules: perms?.allowedModules ?? [],
    permissionAnalysis: perms?.permissionAnalysis ?? {
      modules: [],
      actions: [],
      permissionsByModule: {},
      statistics: {
        totalPermissions: 0,
        totalModules: 0,
        totalActions: 0,
      },
    },
    hasPermission: perms?.hasPermission ?? (() => false),
    hasAnyPermission: perms?.hasAnyPermission ?? (() => false),
    hasAllPermissions: perms?.hasAllPermissions ?? (() => false),
    hasAnyOfPermissions: perms?.hasAnyOfPermissions ?? (() => false),
    getModuleByCode: perms?.getModuleByCode ?? (() => undefined),
    getModulePermissions: perms?.getModulePermissions ?? (() => []),
    getUserMenu: perms?.getUserMenu ?? (() => []),
  };
}
