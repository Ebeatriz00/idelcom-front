import { Plus } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
  current?: boolean;
};

type Props = {
  items: Crumb[];
  createLabel?: string;
  onCreate?: () => void;
  extraContent?: React.ReactNode;
};

export function Breadcrumb({
  items,
  createLabel = "Agregar",
  onCreate,
  extraContent,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* IZQUIERDA: ruta */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 flex-wrap">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {item.href && !item.current && !isLast ? (
                  <a href={item.href} className="hover:underline">
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={
                      item.current || isLast
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && <span>/</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* DERECHA: botón o contenido extra */}
      <div className="flex items-center gap-4">
        {extraContent}
        {onCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Plus className="size-4" /> {createLabel}
          </button>
        )}
      </div>
    </div>
  );
}
