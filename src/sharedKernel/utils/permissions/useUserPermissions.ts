import { useMemo } from "react";
import type {
  ModuleInfo,
  PermissionAnalysis,
  PermissionsResponse,
} from "./permissions.types";

export const useUserPermissions = (
  permissionsData: PermissionsResponse | null
) => {
  const permissionAnalysis = useMemo((): PermissionAnalysis => {
    if (!permissionsData) {
      return {
        modules: [],
        actions: [],
        permissionsByModule: {},
        statistics: {
          totalPermissions: 0,
          totalModules: 0,
          totalActions: 0,
        },
      };
    }

    const modules: string[] = [];
    const actions: string[] = [];
    const permissionsByModule: Record<string, string[]> = {};

    permissionsData.effectiveList.forEach((permissionString) => {
      const parts = permissionString.split(":");
      if (parts.length !== 2) return;

      const [module, action] = parts;

      if (!modules.includes(module)) {
        modules.push(module);
      }

      if (!actions.includes(action)) {
        actions.push(action);
      }

      if (!permissionsByModule[module]) {
        permissionsByModule[module] = [];
      }

      if (!permissionsByModule[module].includes(action)) {
        permissionsByModule[module].push(action);
      }
    });

    return {
      modules: modules.sort(),
      actions: actions.sort(),
      permissionsByModule,
      statistics: {
        totalPermissions: permissionsData.effectiveList.length,
        totalModules: modules.length,
        totalActions: actions.length,
      },
    };
  }, [permissionsData]);

  const hasPermission = (module: string, action: string): boolean => {
    if (!permissionsData) return false;
    const permissionString = `${module}:${action}`;
    return permissionsData.effectiveList.includes(permissionString);
  };

  const hasAnyPermission = (module: string): boolean => {
    if (!permissionsData) return false;
    return permissionsData.effectiveList.some((perm) =>
      perm.startsWith(`${module}:`)
    );
  };

  const hasAllPermissions = (
    module: string,
    requiredActions: string[]
  ): boolean => {
    return requiredActions.every((action) => hasPermission(module, action));
  };

  const hasAnyOfPermissions = (requiredPermissions: string[]): boolean => {
    if (!permissionsData) return false;
    return requiredPermissions.some((permission) =>
      permissionsData.effectiveList.includes(permission)
    );
  };

  const getModuleByCode = (code: string): ModuleInfo | undefined => {
    if (!permissionsData) return undefined;
    return permissionsData.allowedModules.find(
      (module) => module.code === code
    );
  };

  const getModulePermissions = (moduleCode: string): string[] => {
    if (!permissionsData) return [];

    const moduleKey = moduleCode.toLowerCase();

    return permissionsData.effectiveList
      .filter((perm) => perm.startsWith(`${moduleKey}:`))
      .map((perm) => perm.split(":")[1]);
  };

  const getUserMenu = (): ModuleInfo[] => {
    if (!permissionsData) return [];

    return permissionsData.allowedModules
      .filter((module) => {
        const moduleKey = module.code.toLowerCase();
        return hasPermission(moduleKey, "view_module");
      })
      .sort((a, b) => a.orderNo - b.orderNo);
  };

  return {
    // Datos originales del backend
    allowedModuleCodes: permissionsData?.allowedModuleCodes || [],
    effectiveList: permissionsData?.effectiveList || [],
    allowedModules: permissionsData?.allowedModules || [],

    permissionAnalysis,

    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyOfPermissions,
    getModuleByCode,
    getModulePermissions,
    getUserMenu,

    loading: !permissionsData,
    error: null,
  };
};
