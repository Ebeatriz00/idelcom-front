import { forwardRef } from "react";
import { createPortal } from "react-dom";

type PopoverProps = {
  open: boolean;
  className?: string;
  children: React.ReactNode;
  anchorRect: DOMRect;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ open, className = "", children, anchorRect }, ref) => {
    if (!open) return null;

    // Calcula el espacio disponible a la derecha para evitar desbordamientos horizontales
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const spaceOnRight = viewportWidth - anchorRect.left - 16; // 16px de padding de seguridad
    
    // Queremos al menos el ancho del input original, y permitir crecer hasta 500px o el espacio disponible
    const maxAvailableWidth = Math.max(anchorRect.width, Math.min(500, spaceOnRight));

    return createPortal(
      <div
        ref={ref}
        className={`fixed z-50 rounded-md border border-gray-300 bg-white shadow-lg flex flex-col overflow-hidden ${className}`}
        style={{
          top: anchorRect.bottom + 4,
          left: anchorRect.left,
          minWidth: anchorRect.width,
          width: "max-content",
          maxWidth: maxAvailableWidth,
          maxHeight: "16rem",
        }}
        role="presentation"
      >
        {children}
      </div>,
      document.body
    );
  }
);

Popover.displayName = "Popover";
