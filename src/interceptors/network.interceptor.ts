// interceptors/network.interceptor.ts
import axios from 'axios';

let isBackendDown = false;
let lastFailureTime = 0;
const RETRY_DELAY = 10000; // 10 segundos

export function isBackendAvailable() {
  return !isBackendDown;
}

export function markBackendDown() {
  if (!isBackendDown) {
    console.log('[Network] Marcando backend como caído');
    isBackendDown = true;
    lastFailureTime = Date.now();
    
    // Disparar evento global
    window.dispatchEvent(new CustomEvent('backend-down'));
  }
}

export function markBackendRecovered() {
  if (isBackendDown) {
    console.log('[Network] Marcando backend como recuperado');
    isBackendDown = false;
    
    // Disparar evento global
    window.dispatchEvent(new CustomEvent('backend-recovered'));
  }
}

export function setupNetworkInterceptor() {
  // Interceptor de respuesta
  axios.interceptors.response.use(
    (response) => {
      // Si el backend estaba caído y ahora responde, marcar como recuperado
      if (isBackendDown) {
        markBackendRecovered();
      }
      return response;
    },
    (error) => {
      // Detectar errores de conexión
      const isConnectionError =
        !error.response ||
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('ERR_CONNECTION_REFUSED');

      if (isConnectionError) {
        markBackendDown();
      }

      return Promise.reject(error);
    }
  );

  // Interceptor de solicitud
  axios.interceptors.request.use(
    (config) => {
      // Si ha pasado suficiente tiempo desde el último fallo, intentar de nuevo
      if (isBackendDown && Date.now() - lastFailureTime > RETRY_DELAY) {
        console.log('[Network] Intentando reconexión después de delay');
        isBackendDown = false;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  console.log('[Network] Interceptor configurado');
}