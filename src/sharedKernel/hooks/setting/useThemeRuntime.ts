import { applyTheme, type ThemeMode } from "@/sharedKernel";
import { useEffect } from "react";

export function useThemeRuntime(theme: ThemeMode) {
  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);
}
