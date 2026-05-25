import AppNavigation from "./ui/app-navigation";

export default function Header({
  mobileSidebarOpen,
  onToggleMobileSidebar,
  onCloseMobileSidebar,
}: {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/80 backdrop-blur border-b border-gray-200">
      <AppNavigation
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={onToggleMobileSidebar}
        onCloseMobileSidebar={onCloseMobileSidebar}
      />
    </header>
  );
}
