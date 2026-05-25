// types/permissions.types.ts
export interface ModuleInfo {
  modulesId: number;
  code: string;
  label: string;
  path: string | null;
  iconKey: string;
  parentModulesId: number;
  parentId: number | null;
  orderNo: number;
}

export interface PermissionsResponse {
  allowedModuleCodes: string[];
  effectiveList: string[];
  allowedModules: ModuleInfo[];
  hash: string;
}

export interface PermissionAnalysis {
  modules: string[];
  actions: string[];
  permissionsByModule: Record<string, string[]>;
  statistics: {
    totalPermissions: number;
    totalModules: number;
    totalActions: number;
  };
}

export interface UserPermissionsContextType {
  // Datos del backend
  allowedModuleCodes: string[];
  effectiveList: string[];
  allowedModules: ModuleInfo[];
  
  // Análisis dinámico
  permissionAnalysis: PermissionAnalysis;
  
  // Métodos de verificación
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (module: string) => boolean;
  hasAllPermissions: (module: string, actions: string[]) => boolean;
  hasAnyOfPermissions: (requiredPermissions: string[]) => boolean;
  
  // Métodos de módulos
  getModuleByCode: (code: string) => ModuleInfo | undefined;
  getModulePermissions: (moduleCode: string) => string[];
  getUserMenu: () => ModuleInfo[];
  
  // Estado
  loading: boolean;
  error: string | null;
}