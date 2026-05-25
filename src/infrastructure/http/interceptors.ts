import type { AxiosInstance } from "axios";
import { runCoordinatedAuthRefresh } from "./refresh-session";

const AUTH_REFRESH_EXCLUDED_PATHS = [
  "/auth/login",
  "/auth/logout",
  "/auth/refresh",
];

function shouldTryAuthRefresh(error: any) {
  const status = error?.response?.status;
  const originalRequest = error?.config;
  const url = String(originalRequest?.url ?? "").toLowerCase();

  return (
    status === 401 &&
    !!originalRequest &&
    !originalRequest._authRetry &&
    !AUTH_REFRESH_EXCLUDED_PATHS.some((path) => url.includes(path))
  );
}

export function setupInterceptors(http: AxiosInstance) {
  http.interceptors.request.use((config) => {
    return config;
  });

  http.interceptors.response.use(
    (r) => r,
    async (error) => {
      const status = error?.response?.status;
      if (
        status &&
        error?.response?.data &&
        typeof error.response.data === "object"
      ) {
        if (!error.response.data.httpStatus)
          error.response.data.httpStatus = status;
      }

      if (shouldTryAuthRefresh(error)) {
        const originalRequest = error.config as any;
        originalRequest._authRetry = true;

        await runCoordinatedAuthRefresh(http.defaults.baseURL as string);
        return http.request(originalRequest);
      }

      return Promise.reject(error);
    }
  );
  http.interceptors.response.use((resp) => {
    const body = resp.data;
    if (body && typeof body.status === "number") {
      if (body.status !== 1) {
        const err = new Error(body.message || "Operación no válida");
        (err as any).response = { data: body };
        throw err;
      }
      resp.data = Object.prototype.hasOwnProperty.call(body, "data")
        ? body.data
        : body;
    }
    return resp;
  });
}
