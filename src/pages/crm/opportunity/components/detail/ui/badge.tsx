import { cn } from "@/sharedKernel";
import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
};

export function BadgeDetail({ children, variant = "default", className }: BadgeProps) {
  const base = "inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5";
  const variants = {
    default: "bg-blue-600 text-white",
    outline: "border border-gray-300 text-gray-700 bg-white",
  };

  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
