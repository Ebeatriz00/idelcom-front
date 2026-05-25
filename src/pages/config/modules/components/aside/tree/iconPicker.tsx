// shared/IconPicker.tsx
import * as Lucide from "lucide-react";
import { Icon } from "./icon";

const COMMON_LUCIDE = [
  "Shield","Users","Cog","BookUser","FolderLock","Building","User","Home",
  "Package","Settings","Folder","Layers","Boxes","FileText","ClipboardList",
  "ShoppingCart","Truck","Warehouse","CreditCard","BadgeCheck","KeyRound",
];

export function IconPicker({
  value,
  onChange,
  options = COMMON_LUCIDE,
}: {
  value?: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  const safeOptions = options.filter((n) => typeof (Lucide as any)[n] === "function");

  return (
    <div className="flex items-center gap-2">
      <input
        list="lucide-icons"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej. Shield"
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
      />
      <datalist id="lucide-icons">
        {safeOptions.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <span className="border rounded-xl px-3 py-2 flex items-center bg-white">
        <Icon name={value} className="w-5 h-5" />
      </span>
    </div>
  );
}
