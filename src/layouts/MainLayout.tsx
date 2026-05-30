// MainLayout.tsx
import Header from "@/layouts/components/Header.components";
import Sidebar from "@/layouts/components/Sidebar.components";
import { useAuthGuard } from "@/sharedKernel/hooks/security/useAuthGuard";
import { useInactivityLock } from "@/stores";
import { useAuth, useAuth as useAuthStore } from "@/stores/auth";
import { selectLocked } from "@/stores/auth/selectors";
import SessionLocker from "@layouts/components/ui/session-locker";
import { useUI } from "@stores/ui.store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { ServerDownScreen } from "./components/ServerDownScreen";

export default function MainLayout() {
  const locked = useAuthStore(selectLocked);
  const lockReason = useAuth((s) => s.lockReason);

  const [isServerDown, setIsServerDown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileSidebarOpenedAtRef = useRef(0);
  const closeMobileSidebar = useCallback(() => {
    if (Date.now() - mobileSidebarOpenedAtRef.current < 500) return;
    setMobileSidebarOpen(false);
  }, []);
  const openMobileSidebar = useCallback(() => {
    mobileSidebarOpenedAtRef.current = Date.now();
    setMobileSidebarOpen(true);
  }, []);

  const collapsed = useUI((s) => s.sidebarCollapsed);
  const hoverOpen = useUI((s) => s.hoverOpen);
  const isOpenDesktop = !collapsed || hoverOpen;

  const qc = useQueryClient();
  useEffect(() => {
    const onLogout = () => {
      void qc.cancelQueries();
      qc.clear();
    };

    const onLogin = async () => {
      // corta cualquier request en curso
      await qc.cancelQueries({ queryKey: ["auth", "session"], exact: false });

      // resetea estado de la query (borra data, error, status)
      await qc.resetQueries({ queryKey: ["auth", "session"], exact: false });

      // fuerza fetch inmediato de las queries activas
      await qc.refetchQueries({
        queryKey: ["auth", "session"],
        exact: false,
        type: "active",
      });
    };

    window.addEventListener("auth:login_success", onLogin);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:login_success", onLogin);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [qc]);
  const handleLock = useCallback(() => {
    const s = useAuth.getState();

    if (s.locked) {
      if (s.lockReason === "manual" || s.lockReason === "server_down") return;
      return;
    }

    console.log("[MainLayout] Bloqueando sesión");
    s.expireToken("expired");
  }, []);

  useAuthGuard({
    onLock: handleLock,
    refreshSkewSeconds: 60,
  });

  useInactivityLock(60 * 60 * 1000);

  useEffect(() => {
    const handleBackendDown = () => {
      console.log("[MainLayout] Evento backend-down recibido");
      setIsServerDown(true);
    };

    const handleBackendRecovered = () => {
      console.log("[MainLayout] Evento backend-recovered recibido");
      setIsServerDown(false);

      const state = useAuth.getState();
      if (state.locked && state.lockReason === "server_down") {
        useAuth.setState((s) => ({
          ...s,
          token: s.userId && s.businessId ? "http-only" : s.token,
          refreshToken: s.userId && s.businessId ? "http-only" : s.refreshToken,
          isAuthenticated: !!s.userId && !!s.businessId,
          locked: false,
          lockReason: undefined,
        }));
      }
    };

    window.addEventListener("backend-down", handleBackendDown);
    window.addEventListener("backend-recovered", handleBackendRecovered);

    return () => {
      window.removeEventListener("backend-down", handleBackendDown);
      window.removeEventListener("backend-recovered", handleBackendRecovered);
    };
  }, []);

  const shouldShowServerDown =
    isServerDown || (locked && lockReason === "server_down");

  if (shouldShowServerDown) {
    return <ServerDownScreen />;
  }

  return (
    <div className="h-dvh bg-gray-50 font-brand antialiased relative">
      <Header
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={openMobileSidebar}
        onCloseMobileSidebar={closeMobileSidebar}
      />
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobileSidebar={closeMobileSidebar}
      />
      <main
        className={[
          "pt-16",
          "h-[calc(100dvh-4rem)]",
          "overflow-y-auto",
          "transition-[margin] duration-150 ease-out",
          isOpenDesktop ? "lg:ml-64" : "lg:ml-16",
        ].join(" ")}
      >
        <div className="w-full px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>
      {locked && <SessionLocker />}
    </div>
  );
}
