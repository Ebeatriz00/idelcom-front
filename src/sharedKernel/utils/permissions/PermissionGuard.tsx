// components/PermissionGuard.tsx
import React from "react";
import { usePermissions } from "./PermissionsContext";

interface PermissionGuardProps {
  // Verificación por módulo y acción
  module?: string;
  action?: string;

  // Verificación por código de módulo (como viene del backend)
  moduleCode?: string;

  // Múltiples verificaciones
  requiredActions?: string[];
  requiredPermission?: string;
  requiredAny?: string[];

  // Para módulos específicos
  requireViewModule?: boolean;

  // Opciones de visualización
  fallback?: React.ReactNode;
  children: React.ReactNode;
  showForAdmins?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  moduleCode,
  requiredActions,
  requiredPermission,
  requiredAny,
  requireViewModule = false,
  fallback = null,
  children,
  showForAdmins = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAnyOfPermissions } =
    usePermissions();

  const hasAccess = React.useMemo(() => {
    // Si el usuario es admin y showForAdmins es true, permitir acceso
    if (showForAdmins) {
      return true;
    }

    // Verificar permiso específico completo
    if (requiredPermission) {
      return hasAnyOfPermissions([requiredPermission]);
    }

    // Verificar cualquier permiso de una lista
    if (requiredAny && requiredAny.length > 0) {
      return hasAnyOfPermissions(requiredAny);
    }

    // Verificar si requiere permiso "ver módulo" para un módulo específico
    if (requireViewModule && moduleCode) {
      const moduleKey = moduleCode.toLowerCase();
      return hasPermission(moduleKey, "view_module");
    }

    // Verificación por módulo y acción
    if (module && action) {
      return hasPermission(module, action);
    }

    // Verificar múltiples acciones en un módulo
    if (module && requiredActions && requiredActions.length > 0) {
      return requiredActions.every((reqAction) =>
        hasPermission(module, reqAction)
      );
    }

    // Verificar si tiene cualquier permiso en el módulo
    if (module) {
      return hasAnyPermission(module);
    }

    return false;
  }, [
    module,
    action,
    moduleCode,
    requiredActions,
    requiredPermission,
    requiredAny,
    requireViewModule,
    hasPermission,
    hasAnyPermission,
    hasAnyOfPermissions,
    showForAdmins,
  ]);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
