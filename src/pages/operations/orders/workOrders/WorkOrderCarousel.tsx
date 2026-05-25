import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CarouselControls {
  currentIndex: number;
  total: number;
  goNext: () => void;
  goPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  paginationDots: React.ReactNode;
}

interface WorkOrderCarouselProps<T> {
  items: T[];
  renderItem: (item: T, controls: CarouselControls) => React.ReactNode;
  initialIndex?: number;
}

export function WorkOrderCarousel<T>({ items, renderItem, initialIndex = 0 }: WorkOrderCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < items.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, items.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      y: 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      y: 0,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < items.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  const setPage = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  if (items.length === 0) return null;

  const controls: CarouselControls = {
    currentIndex,
    total: items.length,
    goNext: () => paginate(1),
    goPrev: () => paginate(-1),
    canNext: currentIndex < items.length - 1,
    canPrev: currentIndex > 0,
    paginationDots: (
      <div className="flex gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPage(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-blue-600" : "w-1.5 bg-gray-200 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>
    )
  };

  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden min-h-[300px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 40 },
              opacity: { duration: 0.15 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -10000) paginate(1);
              else if (swipe > 10000) paginate(-1);
            }}
            className="w-full"
          >
            {renderItem(items[currentIndex], controls)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
