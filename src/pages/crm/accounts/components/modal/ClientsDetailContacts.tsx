import type { ClientDashboardContactDto } from "@/application";
import { Mail, Phone, User, Users } from "lucide-react";

interface Props {
  contacts: ClientDashboardContactDto[];
}

export function ClientsDetailContacts({ contacts }: Props) {
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Users className="size-5 text-slate-400" />
          Contactos Clave
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {contacts.length} {contacts.length === 1 ? "contacto" : "contactos"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <User className="mb-2 size-8 opacity-20" />
            <p className="text-sm italic">No hay contactos registrados.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.contactsCrmId}
              className="group flex items-center gap-3 rounded-lg border border-slate-50 p-3 transition-all hover:bg-slate-50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 ring-2 ring-white">
                {getInitials(contact.contactName)}
              </div>

              <div className="min-w-0 flex-1">
                <div 
                  className="truncate text-sm font-bold text-slate-800" 
                  title={contact.contactName}
                >
                  {contact.contactName}
                </div>
                <div 
                  className="truncate text-xs text-slate-500"
                  title={contact.jobTitle || "Sin cargo"}
                >
                  {contact.jobTitle || "Sin cargo"}
                </div>
              </div>

              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="rounded-full p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  title="Enviar correo"
                >
                  <Mail className="size-4" />
                </button>
                <button
                  className="rounded-full p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600"
                  title="Llamar"
                >
                  <Phone className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}