// ServerHealthCheck.tsx
import http from "@/infrastructure";
import {
  markBackendDown,
  markBackendRecovered,
} from "@/interceptors/network.interceptor";
import { useEffect } from "react";

export function ServerHealthCheck() {
  useEffect(() => {
    const HEALTH_CHECK_INTERVAL = 15000;

    const checkServerHealth = async () => {
      try {
        await http.head("/Health");
        markBackendRecovered();
      } catch {
        markBackendDown();
      }
    };

    const interval = setInterval(checkServerHealth, HEALTH_CHECK_INTERVAL);
    checkServerHealth();

    return () => clearInterval(interval);
  }, []);

  return null;
}
