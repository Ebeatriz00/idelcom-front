// interceptors/network.interceptor.ts
import axios from "axios";

let isBackendDown = false;
let lastFailureTime = 0;
const RETRY_DELAY = 10000;

export function isBackendAvailable() {
  return !isBackendDown;
}

export function markBackendDown() {
  if (!isBackendDown) {
    isBackendDown = true;
    lastFailureTime = Date.now();
    window.dispatchEvent(new CustomEvent("backend-down"));
  }
}

export function markBackendRecovered() {
  if (isBackendDown) {
    isBackendDown = false;
    window.dispatchEvent(new CustomEvent("backend-recovered"));
  }
}

export function setupNetworkInterceptor() {
  axios.interceptors.response.use(
    (response) => {
      if (isBackendDown) {
        markBackendRecovered();
      }
      return response;
    },
    (error) => {
      const isConnectionError =
        !error.response ||
        error.code === "ERR_NETWORK" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("ERR_CONNECTION_REFUSED");

      if (isConnectionError) {
        markBackendDown();
      }

      return Promise.reject(error);
    },
  );

  axios.interceptors.request.use(
    (config) => {
      if (isBackendDown && Date.now() - lastFailureTime > RETRY_DELAY) {
        isBackendDown = false;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}
