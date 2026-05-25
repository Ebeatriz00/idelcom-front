export function Flag({ children, ok, icon }: { children: React.ReactNode; ok: boolean; icon?: React.ReactNode }) {
    return ok ? (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
            {icon} {children}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200">
            {icon} No {children}
        </span>
    );
}