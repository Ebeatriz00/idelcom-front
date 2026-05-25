import { RefreshCw, ShieldAlert, WifiOff } from "lucide-react";
import robotImg from "@/assets/img/server-down-robot.png";

export function ServerDownScreen() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_45%,#020617_100%)] text-slate-100">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="order-2 lg:order-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <WifiOff className="size-3.5" />
              Estado del sistema
            </div>

            <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              No pudimos conectar con el sistema.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              En este momento el servicio no est&#225; respondiendo. Algunas
              funciones pueden no estar disponibles hasta que todo vuelva a la
              normalidad.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                <RefreshCw className="size-4" />
                Volver a intentar
              </button>

              <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
                <ShieldAlert className="size-4 text-amber-300" />
                Espera unos segundos y vuelve a cargar
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <InfoCard
                title="Qu&#233; pas&#243;"
                text="La aplicaci&#243;n no pudo comunicarse con el sistema."
              />
              <InfoCard
                title="Qu&#233; hacer"
                text="Intenta nuevamente en unos segundos."
              />
              <InfoCard
                title="Tu sesi&#243;n"
                text="Tu informaci&#243;n deber&#237;a mantenerse mientras esto se resuelve."
              />
            </div>
          </section>

          <section className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                    Sin conexi&#243;n
                  </span>
                  <span className="text-xs text-slate-400">Estado actual</span>
                </div>

                <div className="flex items-center justify-center rounded-[1.5rem] bg-slate-950/40 px-4 py-6">
                  <img
                    src={robotImg}
                    alt="Sistema no disponible"
                    className="h-56 w-full max-w-[320px] object-contain"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="inline-block size-2 rounded-full bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.9)]" />
                    Servicio no disponible
                  </div>
                  <p className="text-sm leading-6 text-slate-300">
                    Si el problema contin&#250;a, vuelve a intentarlo en unos
                    minutos o comun&#237;cate con soporte.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
