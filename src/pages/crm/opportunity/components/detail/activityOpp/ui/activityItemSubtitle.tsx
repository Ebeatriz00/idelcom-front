export function ActivityItemSubtitle({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p
      className="mt-1 text-[13px] text-gray-600 leading-[18px] line-clamp-2"
      title={text}
    >
      {text}
    </p>
  );
}
