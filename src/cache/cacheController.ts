import { queryClient } from "@/queryClient";
import { CacheDomains, type CacheDomain } from "./dimains";

export const CacheController = {
  invalidate: (...domains: CacheDomain[]) =>
    Promise.all(
      domains.map((d) =>
        queryClient.invalidateQueries({ queryKey: CacheDomains[d] }),
      ),
    ),
};