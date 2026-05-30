import axios from "axios";

let refreshPromise: Promise<void> | null = null;

export async function runCoordinatedAuthRefresh(baseURL?: string) {
  refreshPromise ??= axios
    .post(
      "/Auth/refresh",
      undefined,
      {
        baseURL: baseURL ?? (import.meta.env.VITE_API_URL as string),
        withCredentials: true,
        timeout: 20000,
      },
    )
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
