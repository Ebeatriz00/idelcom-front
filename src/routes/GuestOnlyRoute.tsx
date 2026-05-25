// routes/GuestOnlyRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/stores/auth";

export default function GuestOnlyRoute() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated && location.pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
