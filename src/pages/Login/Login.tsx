import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/stores/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AuthRequestDto } from "@/application";
import { showApiError } from "@/sharedKernel";


const LOCK_KEY = "auth:lockout_until";
const ATTEMPTS_KEY = "auth:attempts";
const MAX_ATTEMPTS = 3;


function formatMs(ms: number) {
  const s = Math.ceil(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
export default function Login() {

  const { login, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [, setError] = useState<string | null>(null);
  const [lockUntil, setLockUntil] = useState<number>(() => Number(localStorage.getItem(LOCK_KEY)) || 0);
  const [now, setNow] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(() => Number(localStorage.getItem(ATTEMPTS_KEY)) || 0);

  const nav = useNavigate();

  // tick de countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, lockUntil - now);
  const isLocked = remaining > 0;
  useEffect(() => {
    if (!isLocked && lockUntil) {
      localStorage.removeItem(LOCK_KEY);
      setLockUntil(0);
    }
  }, [isLocked, lockUntil]);

  useEffect(() => {
    if (params.get("switch") === "1") {
      logout();                        
      navigate("/login", { replace: true });
    }
  }, [params, logout, navigate]);


  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!user.trim() || !password) {
      setError("Ingresa usuario y contraseña");
      return;
    }
    if (isLocked) {
      setError(`Bloqueado por intentos. Intenta en ${formatMs(remaining)}.`);
      return;
    }
    if (!user.trim() || !password) {
      setError("Ingresa usuario y contraseña");
      return;
    }
    try {
      const payload: AuthRequestDto = {
        usersKey: user.trim(),
        usersPassword: password,
      };

      await login(payload);
      localStorage.removeItem(ATTEMPTS_KEY);
      setAttempts(0);
      nav("/", { replace: true });
    } catch (err: any) {

      await showApiError(err, "Ocurrió un error al iniciar sesión");
      const retryUntil = err?.retryUntil;         
      const retryAfterMs = err?.retryAfterMs;

      if (err?.topCode === "AUTH_LOCKED_OUT") {
        const until = retryUntil ?? (Date.now() + (retryAfterMs ?? 5 * 60 * 1000));
        localStorage.setItem("auth:lockout_until", String(until));
        setLockUntil(until);
        setError(err?.message ?? "Demasiados intentos. Intenta más tarde.");
        return;
      }
      if (err?.topCode === "AUTH_INVALID_CREDENTIALS" || err?.httpStatus === 401) {
        const next = Math.min(MAX_ATTEMPTS, attempts + 1);
        localStorage.setItem(ATTEMPTS_KEY, String(next));
        setAttempts(next);
      }
      setError(err?.message ?? "Credenciales inválidas");
    }
  }

  const disableSubmit = useMemo(
    () => loading || isLocked || !user.trim() || !password,
    [loading, isLocked, user, password]
  );

  return (
    <div className="bg-background min-h-screen flex justify-center">
      {/* Lado izquierdo (hero) */}
      <div
        className="hidden bg-cover lg:block lg:w-2/3"
        style={{
          backgroundImage:
            "url(https://www.idelcom.pe/assets/images/exterior-nosotros.jpg)",
        }}
      >
        <div className="flex items-center h-full px-20 bg-secondary/80">
          <div>
            <h2 className="text-4xl font-display font-bold text-white">Idelcom</h2>
            <p className="max-w-xl mt-3 text-white/80 font-sans">
              Equipos certificados, proyectos sólidos. Gestión a gran escala sin complicaciones.
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho (form + footer) */}
      <div className="flex flex-col items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
        <div className="flex-1 w-full flex items-center">
          <div className="w-full">
            <div className="text-center">
              <h2 className="text-4xl font-display font-bold text-secondary">Inicia sesión</h2>
            </div>

            <div className="mt-8">
              <form onSubmit={onSubmit} noValidate>

                {attempts > 0 && !isLocked && (
                  <div className={`mb-3 text-sm rounded p-2 border
                   ${attempts >= MAX_ATTEMPTS - 1
                      ? "text-red-800 bg-red-50 border-red-200"
                      : "text-amber-800 bg-amber-50 border-amber-200"}`}>
                    {attempts >= MAX_ATTEMPTS - 1
                      ? <>Último intento (<b>{attempts}</b> de <b>{MAX_ATTEMPTS}</b>)</>
                      : <>Intento <b>{attempts}</b> de <b>{MAX_ATTEMPTS}</b></>}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-secondary font-sans">
                    Email o usuario
                  </label>
                  <input
                    id="email"
                    type="text"
                    placeholder="example@company.com"
                    className="block w-full px-4 py-2 mt-1 bg-white border border-secondary/20 rounded-md
                               placeholder-secondary/50 text-secondary font-sans
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-secondary font-sans">
                      Contraseña
                    </label>

                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="block w-full px-4 py-2 bg-white border border-secondary/20 rounded-md
                               placeholder-secondary/50 text-secondary font-sans
                               focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="mt-6">
                  {isLocked && (
                    <div className="mb-3 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                      Bloqueado por muchos intentos.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={disableSubmit}
                    className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200
                               bg-primary rounded-md hover:bg-accent focus:outline-none focus:bg-accent
                               focus:ring focus:ring-accent/40 disabled:opacity-50 font-display font-semibold"
                  >
                    {loading ? "Ingresando..." : isLocked ? `Espera ${formatMs(remaining)}` : "Ingresar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <footer className="py-4 text-center text-sm text-secondary/60 font-sans">
          <span className="text-accent font-semibold">Idelcom</span>  © 2025. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
