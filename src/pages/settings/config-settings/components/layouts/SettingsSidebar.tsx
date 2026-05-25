import { motion } from "framer-motion";
import type { Section } from "./SettingsLayout";

export default function SettingsSidebar({
  sections,
  active,
  onSelect,
}: {
  sections: readonly Section[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold mb-3 text-gray-500 uppercase tracking-wide">
        Configuración
      </h2>
      <nav className="relative space-y-1">
        <motion.div
          key={active}
          layoutId="active-pill"
          className="absolute left-0 right-0 h-9 rounded-lg bg-gray-900/5"
          style={{ top: sections.findIndex((s) => s.id === active) * 40 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`relative z-10 flex w-full items-center gap-2 rounded-lg px-3 h-9 text-sm transition ${
              active === id
                ? "bg-primary/15 text-gray-900 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
