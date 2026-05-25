import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

type ModalProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  overlayClassName?: string;
  rootClassName?: string;
  closeButtonClassName?: string;
  fitContent?: boolean;
  hidden?: boolean;
};

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[min(96vw,90rem)]",
};

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "lg",
  hideCloseButton = false,
  closeOnBackdrop = false,
  closeOnEsc = true,
  contentClassName = "",
  bodyClassName,
  headerClassName,
  footerClassName,
  overlayClassName,
  rootClassName,
  closeButtonClassName,
  fitContent = false,
  hidden = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mouseDownInside = useRef(false);

  const hasSubtitle = !!subtitle;

  useEffect(() => {
    if (!hidden) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [hidden]);

  useEffect(() => {
    if (!onClose || !closeOnEsc || hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, closeOnEsc, hidden]);

  useEffect(() => {
    if (!hidden) {
      const el = contentRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      el?.focus();
    }
  }, [hidden]);
  function handleRootClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onClose || !closeOnBackdrop || hidden) return;
    if (!mouseDownInside.current) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
    mouseDownInside.current = false;
  }

  const titleId = title ? "modal-title" : undefined;

  const responsiveWidth =
    size === "lg"
      ? "w-full sm:max-w-lg md:max-w-xl xl:max-w-2xl"
      : sizeMap[size];

  const widthClasses = fitContent
    ? `w-auto inline-block ${responsiveWidth}`
    : `w-full ${responsiveWidth}`;
  return (
    <div
      className={["fixed inset-0 z-50 items-center justify-center p-4", hidden ? "hidden" : "flex", rootClassName].filter(Boolean).join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleRootClick}
      onMouseDown={() => (mouseDownInside.current = false)}
    >
      <div
        className={overlayClassName ?? "absolute inset-0 bg-black/40"}
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className={[
          "relative rounded-xl overflow-hidden bg-white shadow-2xl ring-1 ring-black/5",
          widthClasses,
          "h-auto max-h-[90vh] flex flex-col",
          contentClassName,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          if (contentRef.current?.contains(e.target as Node)) {
            mouseDownInside.current = true;
          }
        }}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div
            className={
              headerClassName ??
              `z-10 flex shrink-0 items-start gap-3 border-b border-gray-200 bg-white px-5 ${
                hasSubtitle ? "py-4" : "pt-4 pb-2"
              }`
            }
          >
            <div className="min-w-0">
              {title && (
                <h3 id={titleId} className="text-base font-semibold">
                  {title}
                </h3>
              )}
              {hasSubtitle && (
                <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>

            {!hideCloseButton && onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className={
                  closeButtonClassName ??
                  "ml-auto rounded-lg p-2 hover:bg-gray-100"
                }
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={
            bodyClassName ??
            `px-5 ${hasSubtitle ? "pt-4" : "pt-2"} ${
              footer ? "pb-4" : "pb-6"
            } overflow-y-auto flex-1 min-h-0`
          }
        >
          {children}
        </div>
        {footer && (
          <>
            <div className="h-px w-full bg-gray-200" />
            <div
              className={
                footerClassName ??
                "flex min-h-18 shrink-0 items-center justify-end gap-2 bg-white px-5 py-3"
              }
            >
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
