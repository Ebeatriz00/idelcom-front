import { memo, useEffect, useState } from "react";
import { useAuth } from "@/stores/auth";
import {
  selectLocked, selectLockReason, selectUserName, selectReauth,
  selectLogout, selectLoading, selectError
} from "@/stores/auth/selectors";
import { Lock, LogOut } from "lucide-react";

function SessionLockerImpl() {
  const locked = useAuth(selectLocked);
  const lockReason = useAuth(selectLockReason);
  const userName = useAuth(selectUserName);
  const reauth = useAuth(selectReauth);
  const logout = useAuth(selectLogout);
  const loading = useAuth(selectLoading);
  const error = useAuth(selectError);

  const [pwd, setPwd] = useState("");          // hook SIEMPRE

  useEffect(() => {                            // hook SIEMPRE
    if (!locked) return;                       // 👈 guarda la lógica dentro
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);

  if (!locked) return null;                    // 👈 el return va después de hooks

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="size-5" />
          <h2 className="text-lg font-semibold">Sesión bloqueada</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {lockReason === "inactivity" ? "Sesión bloqueada por inactividad."
            : lockReason === "expired" ? "Tu sesión expiró."
              : "Tu sesión está bloqueada."}
          &nbsp;Ingresa tu contraseña para continuar.
        </p>

        <div className="mb-2 text-sm text-gray-800">
          Usuario: <span className="font-medium">{userName ?? "—"}</span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await reauth(pwd);
            if (ok) setPwd("");
          }}
        >
          <input
            type="password"
            autoFocus
            placeholder="Contraseña"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full mb-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
          {error && <div className="text-sm text-rose-600 mb-2">{error}</div>}

          <div className="flex items-center justify-between mt-2">
            <button
              type="submit"
              disabled={loading || !pwd}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-medium hover:bg-black disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Desbloquear"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm hover:bg-gray-100"
            >
              <LogOut className="size-4" /> Salir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(SessionLockerImpl);
