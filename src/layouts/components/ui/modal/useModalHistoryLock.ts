import { useEffect } from "react";

export function useModalHistoryLock(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    // Empuja un estado “falso” para capturar el back
    window.history.pushState({ modal: true }, "");

    const onPopState = () => {
      // Intercepta el back y cierra el modal sin dejar la página
      onClose();
      // Devolvemos el estado para no salirnos de la página
      window.history.pushState({ modal: true }, "");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen, onClose]);
}
