export type ThemeMode = "light" | "dark" | "system";

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  const set = (mode: "light" | "dark") => {
    root.classList.remove("light", "dark");
    root.classList.add(mode);
  };

  if (theme === "system") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    set(mq.matches ? "dark" : "light");
  } else {
    set(theme);
  }
}
