import type { ReactNode } from "react";

export function FieldError({ message }: { message?: unknown }) {
  if (!message) return null;
  const text =
    typeof message === "string"
      ? message
      : "Revise el valor ingresado en este campo";

  return <p className="mt-1 text-xs font-medium text-red-600">{text}</p>;
}

export function Label({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="text-xs font-semibold text-slate-600">
      {children}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </span>
  );
}
