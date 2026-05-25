import React from "react";

type Props = {
  id: string;
  label: string;
  checked?: boolean;                     
  defaultChecked?: boolean;           
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
};

export default function Toggle({
  id,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className = "",
}: Props) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="size-4"
        checked={checked}                
        defaultChecked={defaultChecked} 
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={id} className={disabled ? "opacity-60" : ""}>
        {label}
      </label>
    </div>
  );
}
