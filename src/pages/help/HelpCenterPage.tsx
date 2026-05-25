import { useHelpLayout } from "@/layouts/HelpLayout"; // ✅
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HelpContent } from "./components/HelpContent";
import { HelpSidebar } from "./components/HelpSidebar";
import { HELP_DOCS } from "./help.docs";
import { getAllowedAreasMock } from "./utils/help.function";

export default function HelpCenterPage() {
  const nav = useNavigate();
  const { docId } = useParams<{ docId?: string }>();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { search } = useHelpLayout();

  const allowedAreas = useMemo(() => getAllowedAreasMock(), []);
  const visibleDocs = useMemo(
    () => HELP_DOCS.filter((d) => allowedAreas.includes(d.area)),
    [allowedAreas],
  );

  const currentDoc = useMemo(() => {
    if (!docId) return null;
    return visibleDocs.find((d) => d.id === docId) ?? null;
  }, [docId, visibleDocs]);

  useEffect(() => {
    if (visibleDocs.length === 0) return;

    if (!docId) return;

    const exists = visibleDocs.some((d) => d.id === docId);
    if (!exists) {
      nav(`/help/${visibleDocs[0].id}`, { replace: true });
    }
  }, [docId, visibleDocs, nav]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <div className="h-full flex">
        <aside className="hidden lg:block w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <HelpSidebar
            docs={HELP_DOCS}
            allowedAreas={allowedAreas}
            activeDocId={currentDoc?.id ?? null}
            searchPlaceholder="Buscar en el manual..."
          />
        </aside>
        <main
          id="helpContentScroll"
          className="flex-1 min-w-0 overflow-y-auto bg-gray-50"
        >
          <div className="lg:hidden p-3 border-b border-gray-200 bg-white">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Menu className="size-4" />
            </button>
          </div>

          <HelpContent
            doc={currentDoc}
            allDocs={visibleDocs}
            query={search}
            scrollOffsetPx={110}
          />
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />

          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-[320px] bg-white shadow-xl border-r border-gray-200 overflow-y-auto">
            {/* Header del panel */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Menú</div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-50"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <HelpSidebar
              docs={HELP_DOCS}
              allowedAreas={allowedAreas}
              activeDocId={currentDoc?.id ?? null}
              onCloseMobile={() => setMobileOpen(false)}
              searchPlaceholder="Buscar en el manual..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
