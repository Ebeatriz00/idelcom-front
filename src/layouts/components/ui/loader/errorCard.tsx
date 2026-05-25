export function ErrorCard({ message }: { message: string }) {
  console.error("AsyncState Error:", message);

  const [main, ...rest] = message.split(" (");
  const details = rest.length ? rest.join(" (").replace(/\)$/, "") : "";

  return (
    <div className="rounded-xl border bg-white p-4 text-sm text-rose-600 flex gap-3">
      <span className="mt-1 h-3 w-3 rounded-full bg-rose-600 shrink-0" />
      <div className="min-w-0">
        <div className="font-medium">{main || "Error"}</div>
        {details && (
          <div className="mt-1 text-xs text-rose-500 break-words">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
