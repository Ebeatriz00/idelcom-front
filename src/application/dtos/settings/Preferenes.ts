export type ThemeMode = "light" | "dark" | "system";
export type DensityMode = "compact" | "comfort";

export interface NotifView {
  emailNotif: boolean;
  pushNotif: boolean;
}

export interface PrefeView {
  language: string;
  timezone: string;
}

export interface SettView {
  theme: ThemeMode;
  density: DensityMode;
}
