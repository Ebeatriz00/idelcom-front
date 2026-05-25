export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
                     border-gray-200 text-gray-700 bg-gray-50">
      {children}
    </span>
  );
}