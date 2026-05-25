// App.tsx
import { ServerDownScreen } from "@/layouts/components/ServerDownScreen";
import MainLayout from "@/layouts/MainLayout";
import GuestOnlyRoute from "@/routes/GuestOnlyRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./assets/styles/index.css";
import type { AuthSessionDto } from "./application";
import http from "./infrastructure";
import {
  markBackendDown,
  markBackendRecovered,
  setupNetworkInterceptor,
} from "./interceptors/network.interceptor";
import { ErrorBoundary } from "./layouts/components/ErrorBoundary";
import { ServerHealthCheck } from "./layouts/components/ServerHealthCheck";
import Login from "./pages/Login/Login";
import { useNotifications } from "./realtime/useNotifications";
import { useNotificationsBootstrap } from "./realtime/useNotificationsBootstrap";
import AppRoutes from "./routes/routes";
import { PermissionsProvider } from "./sharedKernel/utils/permissions/PermissionsContext";
import { useAuth } from "./stores/auth";
import { clearSessionProfile } from "./stores/auth/session-profile";
import { clearPersistedNotifications } from "./stores/notifications/notifications.store";
import HelpLayout from "./layouts/HelpLayout";
import HelpCenterPage from "./pages/help/HelpCenterPage";

setupNetworkInterceptor();

function AppRealtimeEffects() {
  useNotificationsBootstrap();
  useNotifications();
  return null;
}

function hasPersistedSessionHint() {
  return (
    localStorage.getItem("auth:flag") === "true" &&
    !!localStorage.getItem("userId") &&
    !!localStorage.getItem("businessId")
  );
}

export default function App() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "up" | "down"
  >("checking");

  useEffect(() => {
    const clearClientAuthState = () => {
      [
        "businessId",
        "userId",
        "workerId",
        "profilesId",
        "areasId",
        "usersVisibiliyId",
        "auth:flag",
        "auth:lock_login_id",
        "auth:login_id",
      ].forEach((key) => localStorage.removeItem(key));
      clearSessionProfile();
      clearPersistedNotifications();

      useAuth.setState((s) => ({
        ...s,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        locked: false,
        lockReason: undefined,
        lockUntil: 0,
        error: null,
      }));
    };

    const syncAuthenticatedState = () => {
      const { userId, businessId } = useAuth.getState();
      if (!userId || !businessId) {
        clearClientAuthState();
        return;
      }

      useAuth.setState((s) => ({
        ...s,
        token: "http-only",
        refreshToken: "http-only",
        isAuthenticated: true,
        locked: false,
        lockReason: undefined,
        error: null,
      }));
    };

    async function check() {
      try {
        let { data } = await http.get<AuthSessionDto>("/Auth/session");

        if (!data?.authenticated && hasPersistedSessionHint()) {
          await http.post("/Auth/refresh");
          const refreshedSession = await http.get<AuthSessionDto>("/Auth/session");
          data = refreshedSession.data;
        }

        if (data?.authenticated) {
          syncAuthenticatedState();
        } else {
          clearClientAuthState();
        }
        console.log("[Bootstrap] Backend UP");
        markBackendRecovered();
        setBackendStatus("up");
      } catch (error: unknown) {
        if ((error as { response?: unknown })?.response) {
          clearClientAuthState();
          markBackendRecovered();
          setBackendStatus("up");
          return;
        }
        console.log("[Bootstrap] Backend DOWN");
        markBackendDown();
        setBackendStatus("down");
      }
    }

    check();
  }, []);

  if (backendStatus === "checking") {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_50%,#020617_100%)] text-slate-100">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-[12%] right-[10%] h-52 w-52 rounded-full bg-sky-500/15 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-md flex-col items-center rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur-md">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-cyan-300/20" />
            <span className="absolute inline-flex h-14 w-14 rounded-full border border-cyan-200/40" />
            <span className="inline-flex h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.95)]" />
          </div>

          <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Conectando
          </div>

          <h2 className="mt-5 text-2xl font-display font-bold text-white">
            Estamos preparando todo
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Estamos verificando el estado del sistema para continuar de forma segura.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300/80 [animation-delay:-0.1s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300/60" />
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === "down") {
    return <ServerDownScreen />;
  }

  return (
    <>
      <AppRealtimeEffects />
      <BrowserRouter>
        <PermissionsProvider>
          <Routes>
            <Route element={<GuestOnlyRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/help/*" element={<HelpLayout />}>
                <Route path=":docId?" element={<HelpCenterPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <ErrorBoundary fallback={<ServerDownScreen />}>
                    <MainLayout />
                  </ErrorBoundary>
                }
              >
                <Route path="/*" element={<AppRoutes />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PermissionsProvider>
      </BrowserRouter>
      <ServerHealthCheck />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
