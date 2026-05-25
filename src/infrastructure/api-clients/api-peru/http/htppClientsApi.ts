import axios, { type AxiosInstance } from "axios";

const httpApiPeru: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APIPERU_CLIENT,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

httpApiPeru.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_APIPERU_TOKEN;
  if (!token) {
    throw new Error(
      "ApiPeru no configurado: falta APIPERU_TOKEN. Configura un proxy/backend para consumir este servicio.",
    );
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default httpApiPeru;
