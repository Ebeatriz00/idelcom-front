import {
  CalendarDays,
  ClipboardCheck,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import type { ReactNode } from "react";

export function getActivityIcon(key?: string): ReactNode {
  const k = (key ?? "").toLowerCase();
  if (k.includes("phone") || k.includes("llam"))
    return <Phone className="size-4" />;
  if (k.includes("mail") || k.includes("email") || k.includes("correo"))
    return <Mail className="size-4" />;
  if (k.includes("calendar") || k.includes("reun"))
    return <CalendarDays className="size-4" />;
  if (k.includes("task") || k.includes("tarea") || k.includes("check"))
    return <ClipboardCheck className="size-4" />;
  if (k.includes("mensaje") || k.includes("chat"))
    return <MessageSquare className="size-4" />;
  return <HelpCircle className="size-4" />;
}
