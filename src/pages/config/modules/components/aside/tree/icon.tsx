// shared/Icon.tsx
import * as Lucide from "lucide-react";
import { FileText } from "lucide-react";

export function getLucideIcon(name?: string) {
  if (!name) return FileText;
  const Cmp = (Lucide as any)[name];
  return typeof Cmp === "function" ? Cmp : FileText;
}

export function Icon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Cmp = getLucideIcon(name);
  return <Cmp className={className} />;
}
