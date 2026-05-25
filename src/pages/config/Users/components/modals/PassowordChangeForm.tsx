import { generateSecurePassword } from "@/sharedKernel";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";

type Props = {
  formId: string;
  usersId?: number;
  saving?: boolean;
  onSubmit: (dto: { usersId: number; usersPassword: string }) => Promise<void>;
};

export function PasswordChangeForm({ formId, usersId, onSubmit }: Props) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(true);

  const valid = !!usersId && pwd.length >= 6 && pwd === confirm;
  const handleGenerate = () => {
    const newPass = generateSecurePassword();
    setPwd(newPass);
    setConfirm(newPass);
    navigator.clipboard.writeText(newPass).catch(() => {});
  };
  return (
    <form
      id={formId}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || !usersId) return;
        await onSubmit({ usersId, usersPassword: pwd });
        setPwd("");
        setConfirm("");
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nueva contraseña
        </label>
        <div className="relative flex items-center">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="•••••••"
            className="w-full rounded-md border border-gray-200 pr-20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            type="button"
            onClick={handleGenerate}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            title="Generar contraseña segura"
          >
            <RefreshCw className="size-4 text-gray-500" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            onClick={() => setShow((v) => !v)}
            aria-label="Mostrar/Ocultar"
          >
            {show ? (
              <EyeOff className="size-4 text-gray-500" />
            ) : (
              <Eye className="size-4 text-gray-500" />
            )}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, número y
          símbolo.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="•••••••"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        {confirm && pwd !== confirm && (
          <p className="mt-1 text-[11px] text-amber-600">
            Las contraseñas no coinciden.
          </p>
        )}
      </div>
      {/* Hint UX si falta el ID */}
      {!usersId && (
        <p className="text-xs text-amber-600">
          Falta el identificador del usuario.
        </p>
      )}
    </form>
  );
}
