import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const panelVariants = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -10 },
};

export default function AnimatedPanel({
  title,
  children,
  panelKey,
}: {
  title: string;
  children: React.ReactNode;
  panelKey: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panelKey}
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-3xl"
      >
        {/* Card container */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
