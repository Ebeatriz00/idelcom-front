import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function DragScrollX({ children, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canDrag, setCanDrag] = useState(false);

  const state = useRef({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
    pointerId: -1,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setCanDrag(el.scrollWidth > el.clientWidth + 2);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "overflow-x-auto overscroll-x-contain",
        canDrag ? "cursor-grab active:cursor-grabbing" : "",
        className ?? "",
      ].join(" ")}
      style={{
        WebkitOverflowScrolling: "touch", // iOS momentum
        touchAction: "pan-x pan-y", // 👈 clave para móvil + trackpad
      }}
      onPointerDown={(e) => {
        const el = ref.current;
        if (!el || !canDrag) return;

        // mouse: solo botón izquierdo
        if (e.pointerType === "mouse" && e.button !== 0) return;

        // no interferir con inputs / botones
        const target = e.target as HTMLElement;
        if (
          target.closest(
            "button,a,input,textarea,select,label,[role='button'],[data-no-drag]"
          )
        ) {
          return;
        }

        state.current.active = true;
        state.current.moved = false;
        state.current.startX = e.clientX;
        state.current.startLeft = el.scrollLeft;
        state.current.pointerId = e.pointerId;

        el.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !state.current.active) return;

        const dx = e.clientX - state.current.startX;
        if (Math.abs(dx) > 2) state.current.moved = true;

        el.scrollLeft = state.current.startLeft - dx;
      }}
      onPointerUp={() => {
        const el = ref.current;
        state.current.active = false;

        if (el && state.current.pointerId !== -1) {
          try {
            el.releasePointerCapture(state.current.pointerId);
          } catch {}
        }

        state.current.pointerId = -1;
      }}
      onPointerCancel={() => {
        state.current.active = false;
        state.current.pointerId = -1;
      }}
      onClickCapture={(e) => {
        if (state.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          state.current.moved = false;
        }
      }}
    >
      {children}
    </div>
  );
}
