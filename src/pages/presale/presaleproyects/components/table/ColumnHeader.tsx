import type { Column } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, Filter, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  placeholder?: string;
}

export function ColumnHeader<TData, TValue>({
  column,
  title,
  placeholder = "Buscar...",
}: ColumnHeaderProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [tempValue, setTempValue] = useState((column.getFilterValue() as string) ?? "");
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen) {
      setTempValue((column.getFilterValue() as string) ?? "");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, column]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleFilterButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isOpen) {
      handleClear();
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(true);
  };

  const handleApply = () => {
    column.setFilterValue(tempValue); 
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempValue("");
    column.setFilterValue(""); 
    setIsOpen(false);
  };

  const handleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSort = column.getIsSorted();
    if (!currentSort) {
      column.toggleSorting(false);
    } else if (currentSort === "asc") {
      column.toggleSorting(true); 
    } else {
      column.clearSorting();
    }
  };

  const isFiltered = !!column.getFilterValue();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleSort}
        className="font-semibold text-gray-700 hover:text-black transition-colors flex items-center gap-1 group"
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownAZ className="h-4 w-4 text-gray-500" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpAZ className="h-4 w-4 text-gray-500" />
        ) : null}
      </button>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleFilterButtonClick}
        className={`p-1 rounded-md transition-all ${
          isFiltered 
            ? "bg-gray-100 text-black ring-1 ring-gray-300 font-medium" 
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
        title={isOpen ? "Clic para borrar filtro" : `Filtrar ${title}`}
      >
        <Filter className="h-3.5 w-3.5" />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ top: coords.top, left: coords.left }}
          className="absolute z-[9999] w-60 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-semibold text-gray-700">Filtrar</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-gray-600 rounded-full p-0.5 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={inputRef}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder={placeholder}
            className="w-full text-sm p-2 border border-gray-200 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black/20"
          />
        </div>,
        document.body
      )}
    </div>
  );
}