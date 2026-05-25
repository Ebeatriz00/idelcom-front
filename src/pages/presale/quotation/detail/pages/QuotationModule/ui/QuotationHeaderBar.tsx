import { Upload } from "lucide-react";
import { Badge } from "../../../components/BadgeQt";
import { IconBtn } from "../../../components/IconBtn";

type Props = {
  title: string;
  subtitle?: string;
  opporId?: number | null;
  onImport: () => void;
  onNew?: () => void;
};

export function QuotationHeaderBar({
  title,
  subtitle,
  onImport,
}: Props) {
  return (
    <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-zinc-900 truncate">
              {title}
            </div>
            <Badge tone="neutral">Corporativo</Badge>
          </div>

          {subtitle ? (
            <div className="mt-0.5 text-xs text-zinc-500 truncate">
              {subtitle}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <IconBtn title="Import Excel" onClick={onImport}>
            <Upload className="h-4 w-4" />
            Importar
          </IconBtn>

          {/*<IconBtn title="New quotation" onClick={onNew}>
            <Plus className="h-4 w-4" />
            Nuevo
          </IconBtn>*/}
        </div>
      </div>
    </div>
  );
}
