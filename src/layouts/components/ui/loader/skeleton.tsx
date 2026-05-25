type TableSkeletonProps = {
  colCount?: number;
  rows?: number;
};

export function TableSkeleton({ colCount = 4, rows = 8 }: TableSkeletonProps) {
  const cols = Array.from({ length: colCount });
  const r = Array.from({ length: rows });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map((_, i) => (
              <th key={i} className="px-3 py-2">
                <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {r.map((_, i) => (
            <tr key={i}>
              {cols.map((_, j) => (
                <td key={j} className="px-3 py-2">
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
