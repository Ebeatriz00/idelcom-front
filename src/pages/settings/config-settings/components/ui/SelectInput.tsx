import React from "react";

export default function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 ${
        props.className ?? ""
      }`}
    />
  );
}
