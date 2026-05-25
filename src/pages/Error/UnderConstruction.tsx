// src/pages/UnderConstruction.tsx
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnderConstruction() {
  return (
    <div className="m-6 min-h-[calc(100vh-150px)]">
      <div className="relative h-full rounded-2xl bg-[var(--color-primary-degrad)] overflow-hidden border border-[var(--color-muted)]">
        {/* fondo curvo */}
        <div className="pointer-events-none absolute inset-y-0 right-[-30%] w-[70%] bg-[#ffe2c7] rounded-l-[999px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-14 gap-10">
          {/* Columna izquierda – Texto */}
          <div className="max-w-md text-left">
            <p className="text-xs font-semibold tracking-[0.25em] text-[var(--color-secondary)] mb-2">
              PÁGINA EN CONSTRUCCIÓN
            </p>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-secondary)] mb-4">
              Estamos preparando algo para ti ✨
            </h1>

            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              Esta sección está en desarrollo. Muy pronto estará disponible y
              podrás utilizar todas las funcionalidades desde aquí. Gracias por
              tu paciencia 🙌
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold shadow-sm hover:bg-[#ff8124] transition"
            >
              Volver al inicio
            </Link>
          </div>

          {/* Columna derecha – Ilustración estilo minimal */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* Base ilustrada */}
              <div className="absolute inset-0 rounded-[45%] bg-[#ffe7d1] shadow-inner" />

              {/* Icon + barrera */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white shadow-xl border border-[var(--color-muted)]">
                  <Construction className="w-24 h-24 text-[var(--color-primary)] animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
