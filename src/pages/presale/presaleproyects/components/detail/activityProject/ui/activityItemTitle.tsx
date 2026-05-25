export function ActivityItemTitle({ title }: { title: string }) {
  return (
    <p className="font-medium text-gray-800 text-sm truncate" title={title}>
      {title}
    </p>
  );
}