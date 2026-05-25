import React from "react";
import { Save } from "lucide-react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function ButtonPrimary({ children, className = "", ...btnProps }: Props) {
  return (
    <button
      {...btnProps}
      className={
        `mt-4 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg
         hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed ` + className
      }
    >
      <Save className="size-4" />
      {children}
    </button>
  );
}
