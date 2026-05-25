// hooks/useAuthStatus.ts - ACTUALIZADO
import { useMemo } from "react";
import { useAuth } from "@/stores/auth";
import {
  selectToken,
  selectIsAuth,
  selectUserName,
  selectLogout,
  selectLocked,
  selectUserPhoto,
} from "@/stores/auth/selectors";

export function useAuthStatus() {
  const token = useAuth(selectToken);
  const isAuth = useAuth(selectIsAuth);
  const locked = useAuth(selectLocked);
  const userName = useAuth(selectUserName);
  const userPhoto = useAuth(selectUserPhoto);
  const logout = useAuth(selectLogout);

  // 👇 CON HTTPONLY: No podemos verificar el JWT directamente
  // Usamos isAuth del store que se establece correctamente
  const active = useMemo(() => {
    // Si tenemos token real, verificamos su estado
    if (token && token !== "http-only" && token !== "http-only-cookie") {
      // Aquí podrías usar isJwtActive si aún manejas tokens en algunos casos
      return isAuth; // O tu lógica anterior con JWT
    }
    // Con HttpOnly, confiamos en el estado isAuth del store
    return isAuth && !locked;
  }, [token, isAuth, locked]);

  return { 
    active, 
    isAuth, 
    locked, 
    userName, 
    userPhoto,
    logout, 
    expiresAt: 0 // No disponible con HttpOnly
  };
}