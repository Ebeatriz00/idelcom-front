import { ArrowLeft, BookOpen } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

type HelpLayoutCtx = {
  search: string;
  setSearch: (v: string) => void;
};

const HelpLayoutContext = createContext<HelpLayoutCtx | null>(null);

export function useHelpLayout() {
  const ctx = useContext(HelpLayoutContext);
  if (!ctx) throw new Error("useHelpLayout must be used inside <HelpLayout />");
  return ctx;
}

export default function HelpLayout() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");

  const value = useMemo(() => ({ search, setSearch }), [search]);

  return (
    <HelpLayoutContext.Provider value={value}>
      <div className="min-h-screen bg-gray-50">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <BookOpen className="size-5 text-gray-700" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-gray-900">
                  Centro de Ayuda
                </div>
                <div className="text-xs text-gray-500">
                  Manual por áreas · Guías · Bloqueos del sistema
                </div>
              </div>
            </div>
            <div className="flex-1" />
            <button
              onClick={() => nav("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              title="Volver al ERP"
            >
              <ArrowLeft className="size-4" />
              Volver
            </button>
          </div>
        </header>

        {/* BODY: ojo aquí, altura fija y sin scroll global */}
        <main className="h-[calc(100vh-64px)] w-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </HelpLayoutContext.Provider>
  );
}
