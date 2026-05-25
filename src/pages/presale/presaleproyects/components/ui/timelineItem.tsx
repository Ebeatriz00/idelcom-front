import { cn } from "@/sharedKernel";

/* ----------------------------- Subcomponentes ----------------------------- */

export function TimelineItem({
  icon,
  title,
  desc,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative pl-9">
      {/* Línea vertical */}
      <span
        className={cn(
          "absolute left-4 top-0 w-px bg-gray-200",
          isLast ? "h-4" : "h-full"
        )}
        aria-hidden
      />
      {/* Punto + icono */}
      <span className="absolute left-1.5 top-1.5 inline-flex items-center justify-center size-5 rounded-full ring-8 ring-white bg-gray-50 border border-gray-200">
        {icon}
      </span>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
    </li>
  );
}
