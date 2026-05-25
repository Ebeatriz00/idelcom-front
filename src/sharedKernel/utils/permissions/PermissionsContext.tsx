// context/PermissionsContext.tsx
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { PermissionsResponse } from "./permissions.types";
import { useUserPermissions } from "./useUserPermissions";

interface PermissionsContextType extends ReturnType<typeof useUserPermissions> {
  isInitialized: boolean;
  setPermissions: (data: PermissionsResponse | null) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [rawPerms, setRawPerms] = useState<PermissionsResponse | null>(null);
  const perms = useUserPermissions(rawPerms);
  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("userPermissions");
    if (stored) {
      try {
        setRawPerms(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userPermissions");
      }
    }
    setInitialized(true);
  }, []);

  const setPermissions = (data: PermissionsResponse | null) => {
    setRawPerms(data);
    if (data) {
      localStorage.setItem("userPermissions", JSON.stringify(data));
    } else {
      localStorage.removeItem("userPermissions");
    }
  };

  const value: PermissionsContextType = {
    ...perms,
    isInitialized,
    setPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions debe usarse dentro de PermissionsProvider");
  }
  return ctx;
}
