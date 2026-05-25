import { useThemeStore } from "@/stores";
import { useEffect } from "react";

export function useThemeEffect() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const apply = (value: "light" | "dark") => {
      root.classList.remove("light", "dark");
      root.classList.add(value);
    };

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(isDark ? "dark" : "light");
    } else {
      apply(theme);
    }
  }, [theme]);
}
