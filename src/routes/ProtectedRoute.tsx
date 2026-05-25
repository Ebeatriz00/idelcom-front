import { useAuth } from "@/stores/auth";
import { SESSION_FLAG_KEY } from "@/stores/auth/constants";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function hasPersistedSessionHint() {
  return (
    localStorage.getItem(SESSION_FLAG_KEY) === "true" &&
    !!localStorage.getItem("userId") &&
    !!localStorage.getItem("businessId")
  );
}

export default function ProtectedRoute() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const locked = useAuth((s) => s.locked);
  const lockReason = useAuth((s) => s.lockReason);
  const location = useLocation();
  const canStayLocked =
    locked &&
    [
      "manual",
      "inactivity",
    ].includes(lockReason ?? "");

  if (locked && lockReason === "server_down") {
    return <Outlet />;
  }

  if (!isAuthenticated && hasPersistedSessionHint() && !canStayLocked) {
    return <Outlet />;
  }

  if (!isAuthenticated && !canStayLocked) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
