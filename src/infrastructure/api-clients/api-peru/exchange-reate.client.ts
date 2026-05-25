import type { ApiExchangeRete, GlobalResponse } from "@/application";
import httpApiPeru from "./http/htppClientsApi";

export async function fetchConsultExchangeRate(
  fecha: string
): Promise<ApiExchangeRete> {
  const { data } = await httpApiPeru.post<GlobalResponse<ApiExchangeRete>>(
    "/tipo-de-cambio",
    { fecha }
  );
  return data.data;
}
