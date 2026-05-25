import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState, useRef } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ImageViewerProps {
  open: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageViewer({ open, images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (open && activeIndex !== null) {
      setScale(1); // Reset zoom when changing image
      const activeThumb = document.getElementById(`viewer-thumb-${activeIndex}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeIndex, open]);

  if (!images?.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 select-none"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
          >
            <X className="size-6" />
          </button>

          <div className="absolute top-6 left-6 text-white/50 font-black text-[10px] uppercase tracking-[0.3em]">
            Referencia {activeIndex + 1} / {images.length}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
            className="absolute left-4 md:left-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors z-10"
          >
            <ChevronLeft className="size-8" />
          </button>

          <motion.div
            ref={containerRef}
            key={activeIndex}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="relative max-w-4xl w-full h-[70vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.stopPropagation();
              setScale((prev) => {
                const zoomSpeed = 0.15;
                // e.deltaY < 0 indicates scrolling up (zoom in)
                const newScale = e.deltaY < 0 ? prev + zoomSpeed : prev - zoomSpeed;
                // Clamp scale between 1x and 4x
                return Math.min(Math.max(1, newScale), 4);
              });
            }}
          >
            <motion.img 
              src={images[activeIndex]} 
              alt={`Evidencia ${activeIndex + 1}`}
              drag={scale > 1}
              dragConstraints={containerRef}
              style={{ scale }}
              className={cn(
                "w-full h-full object-contain drop-shadow-2xl rounded-lg origin-center transition-none",
                scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              )}
            />
          </motion.div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-4 md:right-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors z-10"
          >
            <ChevronRight className="size-8" />
          </button>
          
          <div className="absolute bottom-10 flex items-center justify-center gap-3 w-full max-w-5xl px-10">
            {images.length > 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const container = document.getElementById('viewer-thumb-strip');
                  if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors flex-shrink-0"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            <div 
              id="viewer-thumb-strip"
              className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth items-center py-2 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, index) => (
                <button
                  key={index}
                  id={`viewer-thumb-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-14 w-20 rounded-xl border-2 transition-all flex-shrink-0 flex items-center justify-center overflow-hidden",
                    activeIndex === index 
                      ? "border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20" 
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img 
                    src={url} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>

            {images.length > 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const container = document.getElementById('viewer-thumb-strip');
                  if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors flex-shrink-0"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
