import type { RucData } from "@/application/dtos/api-peru/ruc.dto";
import http from "@/infrastructure/http/httpClient";

export const consultRuc = async (ruc: string): Promise<RucData> => {
  const { data } = await http.post<RucData>(
    "ApiPeru/ConsultRuc",
    { ruc }
  );
  return data;
};
