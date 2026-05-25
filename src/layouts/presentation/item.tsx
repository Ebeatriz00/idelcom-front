export function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className={`mt-0.5 text-sm text-gray-900 ${mono ? "font-mono tabular-nums" : ""}`}>{value}</dd>
        </div>
    );
}