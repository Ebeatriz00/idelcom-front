import { useAuth } from "@/stores/auth";
import { useUI } from "@/stores/ui.store";
import { useAuthStatus } from "@hooks/useAuthStatus";
import { selectLock, selectLogout } from "@stores/auth/selectors";

import {
  ChevronDown,
  HelpCircle,
  Lock,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "./brand-logo";
import { NotificationsDropdown } from "./notifications/notificationsDropdown";

export default function AppNavigation({
  mobileSidebarOpen,
  onToggleMobileSidebar,
  onCloseMobileSidebar,
}: {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
}) {
  const { active, userName, userPhoto } = useAuthStatus();
  const lock = useAuth(selectLock);
  const logout = useAuth(selectLogout);
  const sidebarCollapsed = useUI((s) => s.sidebarCollapsed);
  const setCollapsed = useUI((s) => s.setSidebarCollapsed);
  const hoverOpen = useUI((s) => s.hoverOpen);
  const setHoverOpen = useUI((s) => s.setHoverOpen);
  const setHoverEnabled = useUI((s) => s.setHoverEnabled);

  const [openProfile, setOpenProfile] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const nav = useNavigate();
  const location = useLocation();

  const openHelp = (docId?: string) => {
    // guarda “dónde estaba” para el botón Volver del Help
    sessionStorage.setItem(
      "help_return_to",
      location.pathname + location.search,
    );

    nav(docId ? `/help/${docId}` : "/help");
  };

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isSidebarOpen = !sidebarCollapsed || hoverOpen;

  const getUserInitials = (name: string | null): string => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getAvatarColor = (name: string | null): string => {
    if (!name) return "bg-gray-200";
    const colors = ["bg-gray-200"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setOpenProfile(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenProfile(false);
        setMobileSearch(false);
        onCloseMobileSidebar();
      }

      const focused = document.activeElement as HTMLElement | null;
      const isTyping =
        focused &&
        (focused.tagName === "INPUT" ||
          focused.tagName === "TEXTAREA" ||
          focused.getAttribute("contenteditable") === "true");

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) {
          searchRef.current?.focus();
        } else {
          setMobileSearch(true);
        }
      }

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const ok = (isMac && e.metaKey) || (!isMac && e.ctrlKey);
      if (ok && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) {
          searchRef.current?.focus();
        } else {
          setMobileSearch(true);
        }
      }
    }

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onCloseMobileSidebar]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "gm_sidebar_collapsed",
        sidebarCollapsed ? "1" : "0",
      );
    } catch {}
  }, [sidebarCollapsed]);

  return (
    <>
      <div className="mx-auto max-w-screen-2xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburguesa (solo móvil) */}

          <button
            onClick={() => {
              setMobileSearch(false);
              if (!mobileSidebarOpen) {
                onToggleMobileSidebar();
              }
            }}
            className="inline-flex touch-manipulation lg:hidden items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 hover:bg-gray-50"
            aria-label="Abrir menú"
            aria-controls="app-sidebar-mobile"
            aria-expanded={mobileSidebarOpen}
          >
            <Menu className="size-5" />
          </button>

          {/* Toggle colapso (desktop) */}
          <button
            onClick={() => {
              setCollapsed((v) => !v);
              setHoverOpen(false);
              setHoverEnabled(true);
            }}
            aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            className="hidden md:inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 transition-colors hover:bg-gray-50"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeftOpen className="size-5" />
            )}
          </button>
          <BrandLogo />
        </div>

        {/* Search desktop */}
        <div
          className="hidden md:flex flex-1 justify-center px-6"
          role="search"
        >
          <label className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar órdenes, clientes, proyectos… (Ctrl + K)"
              aria-label="Buscar"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
          </label>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            aria-label="Buscar"
            onClick={() => setMobileSearch((v) => !v)}
          >
            <Search className="size-5" />
          </button>
          <button
            hidden
            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            aria-label="Cambiar tema"
          >
            <Moon className="size-5" />
          </button>
          <button
            onClick={() => openHelp()}
            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            aria-label="Ayuda"
            title="Ayuda"
          >
            <HelpCircle className="size-5" />
          </button>

          <NotificationsDropdown />

          {/* Perfil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-haspopup="menu"
              aria-expanded={openProfile}
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={`Foto de ${userName}`}
                  className="size-7 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div
                  className={`size-7 rounded-full flex items-center justify-center text-gray-700 text-xs font-semibold ${getAvatarColor(
                    userName,
                  )}`}
                >
                  {getUserInitials(userName)}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium">
                {active ? (userName ?? "Usuario") : "Invitada/o"}
              </span>
              <ChevronDown className="size-4" />
            </button>

            {openProfile && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg p-1"
              >
                <Link
                  to="/settings/profiles-settings"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  <User className="size-4" /> Perfil
                </Link>

                <Link
                  to="/settings/config-settings"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  <Settings className="size-4" /> Configuración
                </Link>

                {active ? (
                  <>
                    <button
                      onClick={() => lock("manual")}
                      role="menuitem"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-left"
                    >
                      <Lock className="size-4" /> Bloquear
                    </button>
                    <button
                      onClick={logout}
                      role="menuitem"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-left"
                    >
                      <LogOut className="size-4" /> Salir
                    </button>
                  </>
                ) : (
                  <a
                    href="/login"
                    role="menuitem"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <User className="size-4" /> Iniciar sesión
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda móvil */}
      {mobileSearch && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-screen-2xl px-4 py-2">
            <label className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                autoFocus
                type="search"
                placeholder="Buscar…"
                aria-label="Buscar"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
              />
              <button
                onClick={() => openHelp()}
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
                aria-label="Ayuda"
                title="Ayuda"
              >
                <HelpCircle className="size-5" />
              </button>
            </label>
          </div>
        </div>
      )}
    </>
  );
}
