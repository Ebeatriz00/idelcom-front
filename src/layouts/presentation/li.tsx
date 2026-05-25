
export function Li({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-gray-800">
            {icon && <span className="mt-0.5 text-gray-500">{icon}</span>}
            <span>{children}</span>
        </li>
    );
}