// src/components/ui/SectionLoader.tsx

import { Spinner } from "./spinner";

type SectionLoaderProps = {
  label?: string;
};

export function SectionLoader({ label = "Cargando…" }: SectionLoaderProps) {
  return (
    <div className="rounded-xl border bg-white p-4 text-sm flex items-center gap-2">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
