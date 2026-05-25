
import { buildNavSectionsWithPerms, type AllowedModule, type NavSection } from "@/sharedKernel";
import { useMemo } from "react";

export function useNavSectionsFromPayload(
  allowedModules?: AllowedModule[] | null,
  effectiveList?: string[] | null
) {
  return useMemo<NavSection[]>(() => {
    if (!allowedModules?.length || !effectiveList?.length) return [];
    return buildNavSectionsWithPerms(allowedModules, effectiveList);
  }, [allowedModules, effectiveList]);
}
