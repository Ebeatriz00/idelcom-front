// hooks/useAutoSidebarWidth.ts
import { useEffect, useMemo, useState } from "react";

type Params = {
  enabled: boolean;          
  labels: string[];          
  min: number;               
  max: number;               
  basePadding?: number;     
  iconBlock?: number;        
  font?: string;             
};

export function useAutoSidebarWidth({
  enabled,
  labels,
  min,
  max,
  basePadding = 48, 
  iconBlock = 28,   
  font = "14px Inter, ui-sans-serif",
}: Params) {
  const [width, setWidth] = useState<number>(min);

  const longest = useMemo(
    () => labels.reduce((m, s) => (s.length > m.length ? s : m), ""),
    [labels]
  );

  useEffect(() => {
    if (!enabled) {
      setWidth(min);
      return;
    }
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = font;
    const textWidth = ctx.measureText(longest).width;

    const desired = Math.ceil(textWidth + basePadding + iconBlock);
    const clamped = Math.max(min, Math.min(desired, max));
    setWidth(clamped);
  }, [enabled, longest, min, max, basePadding, iconBlock, font]);

  return width;
}
