export function Badge({
  children,
  icon,
  tone = "gray",
  className = "",
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone?: "gray" | "orange" | "emerald" | "violet" | "sky";
  className?: string;
}) {
  const styles = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-100 text-orange-700",
    emerald: "bg-emerald-100 text-emerald-700",
    violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${styles[tone]} ${className}`}
    >
      <span className="flex items-center justify-center shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}