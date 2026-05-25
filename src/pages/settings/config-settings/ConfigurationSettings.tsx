import { Bell, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import AnimatedPanel from "./components/layouts/AnimatedPanel";
import AppearanceSection from "./components/layouts/secction/AppearanceSection";
import NotificationsSection from "./components/layouts/secction/NotificationsSection";
import PreferencesSection from "./components/layouts/secction/PreferencesSection";
import type { Section } from "./components/layouts/SettingsLayout";
import SettingsLayout from "./components/layouts/SettingsLayout";

export default function ConfigurationSettings() {
  const [active, setActive] = useState("notificaciones");

  const sections: readonly Section[] = [
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "preferencias", label: "Preferencias", icon: SlidersHorizontal },
  ];

  return (
    <SettingsLayout
      sections={sections}
      side="left"
      active={active}
      onSelect={setActive}
    >
      {active === "notificaciones" && (
        <AnimatedPanel title="Notificaciones" panelKey="notificaciones">
          <NotificationsSection />
        </AnimatedPanel>
      )}
      {active === "preferencias" && (
        <AnimatedPanel title="Preferencias" panelKey="preferencias">
          <PreferencesSection />
        </AnimatedPanel>
      )}
      {active === "apariencia" && (
        <AnimatedPanel title="Apariencia" panelKey="apariencia">
          <AppearanceSection />
        </AnimatedPanel>
      )}
    </SettingsLayout>
  );
}
