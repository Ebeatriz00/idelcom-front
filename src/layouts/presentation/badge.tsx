
export function Badge({ children, ok, icon }: { children: React.ReactNode; ok?: boolean; icon?: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>
            {icon} {children}
        </span>
    );
}