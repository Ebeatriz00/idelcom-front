// AsyncState.tsx
import type { ReactNode } from "react";
import { ErrorCard } from "./errorCard";

type AsyncStateProps = {
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

function getErrorMessage(error: unknown) {
  // Axios style
  const data = (error as any)?.response?.data ?? (error as any)?.data ?? error;

  const msg =
    data?.message ??
    (error as any)?.message ??
    (typeof error === "string" ? error : null);

  const details = data?.details;

  // Si hay details, lo pegamos para que el usuario (y tú) vean el motivo real
  if (details && msg) return `${msg} (${details})`;
  if (details) return String(details);
  if (msg) return String(msg);

  return "Ocurrió un error inesperado.";
}


export function AsyncState({
  isLoading,
  error,
  isEmpty,
  children,
}: AsyncStateProps) {
  if (error) {
    const msg = getErrorMessage(error);
    return <ErrorCard message={msg} />;
  }
  return (
    <>
      {children}
      {!isLoading && isEmpty && <div className="mt-4"></div>}
    </>
  );
}
