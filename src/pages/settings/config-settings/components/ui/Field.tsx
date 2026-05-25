import { motion } from "framer-motion";
import React from "react";

const rowVariants = {
  initial: { opacity: 0, y: 6 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i },
  }),
};

export default function Field({
  label,
  children,
  index,
}: {
  label: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      className="space-y-1"
      custom={index}
      variants={rowVariants}
      initial="initial"
      animate="animate"
    >
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </motion.div>
  );
}
