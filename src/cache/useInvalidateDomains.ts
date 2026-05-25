import { useQueryClient } from "@tanstack/react-query";
import { CacheDomains, type CacheDomain } from "./dimains";

export function useInvalidateDomains() {
  const qc = useQueryClient();

  const invalidate = async (...domains: CacheDomain[]) => {
    await Promise.all(
      domains.map((d) => qc.invalidateQueries({ queryKey: CacheDomains[d] })),
    );
  };

  const invalidateAll = async () => {
    await qc.invalidateQueries({ predicate: () => true });
  };

  const clearAll = async () => {
    await qc.cancelQueries();
    qc.clear();
  };

  return {
    invalidate,
    invalidateAll,
    clearAll,
  };
}
