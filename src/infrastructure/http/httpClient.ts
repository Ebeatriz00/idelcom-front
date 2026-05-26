import type { GlobalResponse } from "@/sharedKernel";
import type { AxiosInstance } from "axios";
import axios from "axios";
import { setupInterceptors } from "./interceptors";

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  timeout: 20000,
});

declare module "axios" {
  export interface AxiosInstance {
    get<T = GlobalResponse, R = { data: T }, D = any>(url: string, config?: any): Promise<R>;
    post<T = GlobalResponse, R = { data: T }, D = any>(
      url: string,
      data?: D,
      config?: any
    ): Promise<R>;
    put<T = GlobalResponse, R = { data: T }, D = any>(
      url: string,
      data?: D,
      config?: any
    ): Promise<R>;
    delete<T = GlobalResponse, R = { data: T }, D = any>(url: string, config?: any): Promise<R>;
  }
}

setupInterceptors(http);

export default http;
