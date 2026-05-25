import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { IconBtn } from "../../../components/IconBtn";

type Props = {
  headerRight?: React.ReactNode;
  onAddGroup?: () => void;
  onAddItem?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("dragging");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onLeave = () => (isDown = false);
    const onUp = () => (isDown = false);

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  return ref;
}

export function DetailLinesCard({
  onAddGroup,
  onAddItem,
  children,
  footer,
}: Props) {
  const dragRef = useDragScroll();
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            Detalle de líneas
          </div>
          <div className="text-xs text-zinc-500">
            Padre/hijo · grupo en negrita · preventa en rojo
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconBtn title="Agregar grupo" onClick={onAddGroup}>
            <Plus className="h-4 w-4" />
            Agregar grupo
          </IconBtn>
          <IconBtn title="Agregar item" onClick={onAddItem}>
            <Plus className="h-4 w-4" />
            Agregar item
          </IconBtn>
        </div>
      </div>

      <div
        ref={dragRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>

      {footer ? (
        <div className="border-t border-zinc-200 p-4">{footer}</div>
      ) : null}
    </div>
  );
}
