// ServerHealthCheck.tsx
import http from "@/infrastructure";
import { markBackendDown, markBackendRecovered } from "@/interceptors/network.interceptor";
import { useEffect } from "react";

export function ServerHealthCheck() {
  useEffect(() => {
    const HEALTH_CHECK_INTERVAL = 15000;

    const checkServerHealth = async () => {
      try {
        await http.head("/Health");
        console.log("[HealthCheck] Backend disponible");
        markBackendRecovered();
      } catch (error: any) {
        console.log("[HealthCheck] Backend no responde", {
          code: error?.code,
          message: error?.message,
          status: error?.response?.status,
        });

        // 🔥 FORZAR estado de backend caído
        markBackendDown();
      }
    };

    const interval = setInterval(checkServerHealth, HEALTH_CHECK_INTERVAL);
    checkServerHealth();

    return () => clearInterval(interval);
  }, []);

  return null;
}
