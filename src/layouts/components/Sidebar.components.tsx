import AppSidebarTree from "@/layouts/components/ui/app-sidebar";
import { Portal } from "@/layouts/components/ui/Portal";
import { useAuthBootstrap, useNavSectionsFromPayload } from "@/sharedKernel";
import { useUI } from "@/stores/ui.store";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

function SidebarContent({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (isLoading) {
    return <div className="p-4 text-xs text-gray-500">Cargando menu...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-xs text-red-600">
        No se pudo cargar el menu.{" "}
        <button className="underline" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-500 select-none">
        <div className="flex max-w-[240px] flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all">
          <div className="h-30 w-20 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-gray-700">{emptyMessage}</p>
          <p className="text-xs leading-snug text-gray-500">
            Pide acceso al administrador
          </p>
          <button
            onClick={onRetry}
            className="mt-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Sidebar({
  mobileOpen,
  onCloseMobileSidebar,
}: {
  mobileOpen: boolean;
  onCloseMobileSidebar: () => void;
}) {
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const hoverOpen = useUI((s) => s.hoverOpen);
  const setHoverOpen = useUI((s) => s.setHoverOpen);
  const hoverEnabled = useUI((s) => s.hoverEnabled);
  const setHoverEnabled = useUI((s) => s.setHoverEnabled);
  const openedAtRef = useRef(0);

  const isOpenDesktop = useMemo(
    () => !collapsed || hoverOpen,
    [collapsed, hoverOpen],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    openedAtRef.current = Date.now();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const { pathname } = useLocation();
  useEffect(() => {
    if (mobileOpen) onCloseMobileSidebar();
  }, [pathname, mobileOpen, onCloseMobileSidebar]);

  useEffect(() => {
    if (!collapsed) {
      setHoverOpen(false);
      setHoverEnabled(false);
    }
  }, [collapsed, setHoverEnabled, setHoverOpen]);

  const { data, isLoading, isError, refetch } = useAuthBootstrap();

  const allowed = data?.allowedModules ?? [];
  const effective = data?.effectiveList ?? [];
  const sections = useNavSectionsFromPayload(allowed, effective);
  const treeKey = `nav-${data?.hash ?? "empty"}`;
  const expandedKey = `${data?.hash ?? "empty"}:${data?.allowedModuleCodes?.join("|") ?? "none"}`;

  const isEmpty = !isLoading && !isError && sections.length === 0;
  const emptyMessage =
    allowed.length > 0
      ? "No tienes accesos disponibles en este menu."
      : "No tienes modulos asignados todavia.";

  function handleOverlayClick() {
    if (Date.now() - openedAtRef.current < 350) return;
    onCloseMobileSidebar();
  }

  return (
    <>
      <aside
        id="app-sidebar"
        onMouseEnter={() => collapsed && hoverEnabled && setHoverOpen(true)}
        onMouseLeave={() => collapsed && hoverEnabled && setHoverOpen(false)}
        className={`hidden lg:block fixed left-0 top-16 ${
          isOpenDesktop ? "w-64" : "w-16"
        } h-[calc(100vh-64px)] border-r border-gray-200 bg-white transition-[width] duration-150 ease-out will-change-[width]`}
      >
        <div className="h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          <SidebarContent
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            emptyMessage={emptyMessage}
            onRetry={refetch}
          >
            <AppSidebarTree
              key={treeKey}
              isOpen={isOpenDesktop}
              sections={sections}
              storageKey={expandedKey}
            />
          </SidebarContent>
        </div>
      </aside>

      {mobileOpen ? (
        <Portal>
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 z-[70]">
            <div
              className="absolute inset-0 bg-black/40 transition-opacity duration-150 ease-out opacity-100"
              onClick={handleOverlayClick}
            />
            <div
              id="app-sidebar-mobile"
              className="absolute left-0 top-0 h-[calc(100dvh-64px)] w-72 max-w-[85vw] border-r border-gray-200 bg-white shadow-lg transition-transform duration-150 ease-out will-change-transform translate-x-0"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegacion"
            >
              <div className="h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
                <SidebarContent
                  isLoading={isLoading}
                  isError={isError}
                  isEmpty={isEmpty}
                  emptyMessage={emptyMessage}
                  onRetry={refetch}
                >
                  <AppSidebarTree
                    key={treeKey}
                    isOpen={true}
                    variant="mobile"
                    sections={sections}
                    storageKey={expandedKey}
                    onNavigate={onCloseMobileSidebar}
                  />
                </SidebarContent>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
