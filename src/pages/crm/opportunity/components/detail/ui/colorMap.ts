export const BG_TO_TEXT: Record<string, string> = {
  "bg-red-500": "text-red-500",
  "bg-amber-400": "text-amber-400",
  "bg-blue-500": "text-blue-500",
  "bg-blue-400": "text-blue-400",
  "bg-gray-400": "text-gray-400",
  "bg-indigo-500": "text-indigo-500",
  "bg-orange-400": "text-orange-400",
  "bg-emerald-500": "text-emerald-500",
  "bg-gray-600": "text-gray-600",
};

export function bgToTextClass(input?: string | null) {
  if (!input) return "text-gray-400";
  if (input.startsWith("text-")) return input;
  return BG_TO_TEXT[input] ?? "text-gray-400";
}
