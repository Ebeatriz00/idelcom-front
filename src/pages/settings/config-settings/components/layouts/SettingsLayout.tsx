import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";

export type Section = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function SettingsLayout({
  sections,
  side = "left",
  active,
  onSelect,
  children,
  offsetPx = 0,
}: {
  sections: readonly Section[];
  side?: "left" | "right";
  active: string;
  onSelect: (id: string) => void;
  children: React.ReactNode;
  offsetPx?: number;
}) {
  const isRight = side === "left";
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <motion.aside
      key="settings-sidebar"
      initial={{ x: isRight ? 120 : -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isRight ? 120 : -120, opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className={`${
        isRight ? " rounded-l-xl" : "rounded-r-xl"
      } w-full lg:w-64 bg-white p-4 shadow-sm`}
    >
      <SettingsSidebar
        sections={sections}
        active={active}
        onSelect={(id) => {
          onSelect(id);
          setOpen(false);
        }}
      />
    </motion.aside>
  );

  return (
    <div
      className={`flex flex-col lg:flex-row bg-gray-50 ${
        isRight ? "lg:flex-row-reverse" : ""
      }`}
      style={{ minHeight: `calc(50dvh - ${offsetPx}px)` }}
    >
      {/* Header sólo en móvil */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b bg-white/60 backdrop-blur">
        <h1 className="text-sm font-semibold">Configuración</h1>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs px-3 py-1 border rounded-md hover:bg-gray-50"
          aria-expanded={open}
          aria-controls="settings-sidebar"
        >
          {open ? "Cerrar menú" : "Abrir menú"}
        </button>
      </div>

      {/* Sidebar en desktop */}
      <div className={`hidden lg:block ${isRight ? "order-2" : "order-1"}`}>
        {Sidebar}
      </div>

      {/* Sidebar móvil (overlay) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setOpen(false)}
            />
            <div
              className={`absolute top-0 bottom-0 ${
                isRight ? "right-0" : "left-0"
              } w-[85%] max-w-72`}
            >
              {Sidebar}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel principal */}
      <main
        className={`flex-1 px-4 lg:px-8 pt-0 lg:pt-0 pb-4 lg:pb-6 overflow-visible ${
          isRight ? "order-1" : "order-2"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
