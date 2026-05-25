import type { ProfileData } from "@/application";

export function PersonalInfoCard({
  data,
  onChange,
  onSave,
  saving,
  className = "",
}: {
  data: ProfileData;
  onChange: (patch: Partial<ProfileData>) => void;
  onSave: () => void;
  saving?: boolean;
  className?: string;
}) {
  return (
    <div className={"rounded-2xl  bg-white p-6 shadow-sm " + className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Información personal</h2>
        <button
          onClick={onSave}
          disabled={!!saving}
          className="rounded-2xl bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nombre
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Apellido
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.lastName}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Documento
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.documentType}
            disabled
            onChange={(e) => onChange({ documentType: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Documento
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.document}
            onChange={(e) => onChange({ document: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Correo
          </label>
          <input
            type="email"
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Cargo
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
            value={data.position}
            onChange={(e) => onChange({ position: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
