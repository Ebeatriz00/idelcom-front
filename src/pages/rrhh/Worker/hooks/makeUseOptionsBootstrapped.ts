import type { OptionItem } from "@/application";
import type { UseOptionsHook } from "@/layouts";
import { useEffect, useMemo, useRef, useState } from "react";

type MakeArgs = {
  base: UseOptionsHook;
  bootstrapValue?: number | string | null;
  enabled?: boolean;
  equals?: (opt: OptionItem, id: number | string) => boolean;
};

export function makeUseOptionsBootstrapped({
  base,
  bootstrapValue,
  enabled = true,
  equals = (o, id) => String(o.value) === String(id),
}: MakeArgs) {
  function useOptionsBootstrapped(page: number, q: string, pageSize: number) {
    const onceRef = useRef(true);
    const [forcedQ, setForcedQ] = useState<string | null>(null);

    const effectiveQ = useMemo(() => {
      if (enabled && onceRef.current && bootstrapValue != null) {
        return String(bootstrapValue);
      }
      return forcedQ ?? q;
    }, [enabled, q, forcedQ, bootstrapValue]);

    const res = base(page, effectiveQ, pageSize);

    useEffect(() => {
      const items = res.data?.items ?? [];
      if (enabled && onceRef.current && bootstrapValue != null) {
        const found = items.some((it) => equals(it, String(bootstrapValue)));
        if (found) {
          onceRef.current = false;
          setForcedQ(null);
        }
      }
    }, [res.data?.items, enabled, bootstrapValue, equals]);

    return res;
  }

  return useOptionsBootstrapped;
}
