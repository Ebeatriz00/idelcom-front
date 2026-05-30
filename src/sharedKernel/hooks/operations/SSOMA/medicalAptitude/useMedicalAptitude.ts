import type { OptionItem, PagedSelect } from "@/application";
import { fetchMedicalAptitudeSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";
import { qkMedicalAptitude } from "./medicalAptitude.qk";

export function useMedicalAptitudeOptions(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkMedicalAptitude.select(page, pageSize, s),
    queryFn: () => fetchMedicalAptitudeSelect(page, pageSize, s),
    placeholderData: undefined,
    enabled: opts?.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}
