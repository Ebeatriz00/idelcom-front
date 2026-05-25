import { useState, useRef, useEffect } from "react";
import { Calendar, User, CornerDownLeft, Flag, CornerDownRight } from "lucide-react";
import { cn } from "@/sharedKernel";
import type { OptionItem } from "@/application";
import { StatusChip } from "./ui/statusChip"; 
import { PriorityChip } from "./ui/priorityChip";
import Swal from "sweetalert2"; // <--- 1. IMPORTAR SWAL

const FALLBACK_COLORS: Record<number, string> = {
    1: "bg-red-500", 2: "bg-amber-400", 3: "bg-blue-500", 4: "bg-green-500", 0: "bg-blue-500"
};

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00"); 
    return date.toLocaleDateString("es-ES", { weekday: 'short', day: 'numeric' });
};

// Función helper para formatear fecha completa para el mensaje (ej: "25 de Febrero, 2026")
const formatDateLong = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' });
};

type Props = {
    stateId: number;
    workerOptions: OptionItem[];
    priorityOptions: OptionItem[];
    indicatorColor?: string;
    percentage?: number; 
    onSave: (title: string, stateId: number, workerId?: number, date?: Date, priorityId?: number) => void;
    initialOpen?: boolean; 
    onClose?: () => void;
    isSubtask?: boolean;
    isOpenExternal?: boolean; 
    projectEndDate?: string | Date; 
};

export function TaskColumnFooter({ 
    stateId, 
    workerOptions, 
    priorityOptions, 
    indicatorColor, 
    percentage = 0, 
    onSave,
    initialOpen = false,
    onClose,
    isSubtask = false,
    isOpenExternal,
    projectEndDate 
}: Props) {
    const [isAdding, setIsAdding] = useState(initialOpen);
    const [isFocused, setIsFocused] = useState(true); 

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [selectedWorker, setSelectedWorker] = useState<number | undefined>(undefined);
    const [selectedPriority, setSelectedPriority] = useState<number | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<string>(""); 

    useEffect(() => {
        if (initialOpen !== undefined) setIsAdding(initialOpen);
    }, [initialOpen]);

    useEffect(() => {
        if (isOpenExternal !== undefined) {
            setIsAdding(isOpenExternal);
        }
    }, [isOpenExternal]);

    useEffect(() => {
        if (priorityOptions.length > 0 && selectedPriority === undefined) {
            const normalOption = priorityOptions.find(p => p.label.toUpperCase() === "NORMAL");
            if (normalOption) setSelectedPriority(Number(normalOption.value));
        }
    }, [priorityOptions, selectedPriority]);

    useEffect(() => {
        if (isAdding) { setIsFocused(true); setTimeout(() => inputRef.current?.focus(), 50); }
    }, [isAdding]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // No cerramos si hay un SweetAlert abierto, para evitar conflictos de foco
                if (Swal.isVisible()) return;
                setIsFocused(false); 
            }
        }
        if (isAdding) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isAdding]);

    const handleReactivate = () => { if (!isFocused) { setIsFocused(true); setTimeout(() => inputRef.current?.focus(), 0); } };
    
    const handleReset = () => {
        setTitle(""); setSelectedWorker(undefined); 
        const normalOption = priorityOptions.find(p => p.label.toUpperCase() === "NORMAL");
        setSelectedPriority(normalOption ? Number(normalOption.value) : undefined);
        setSelectedDate(""); 
        
        setIsAdding(false); 
        setIsFocused(true);
        if(onClose) onClose(); 
    };

    const handleSave = () => {
        if (!title.trim()) return;

        // --- VALIDACIÓN DE FECHA CON SWEETALERT ---
        if (projectEndDate && selectedDate) {
            const limitStr = String(projectEndDate).split('T')[0];
            const currentStr = selectedDate; 
            
            if (currentStr > limitStr) {
                // Formateamos la fecha límite para que se vea elegante en el mensaje
                const niceDate = formatDateLong(limitStr);

                Swal.fire({
                    title: "Fecha fuera de rango",
                    html: `El proyecto finaliza el <b>${niceDate}</b>.<br/>No puedes programar tareas después de esa fecha.`,
                    icon: "warning",
                    confirmButtonColor: "#EF4444", // Rojo alerta
                    confirmButtonText: "Entendido",
                    focusConfirm: true,
                    customClass: {
                        popup: "rounded-2xl font-sans" // Ajuste opcional de estilo
                    }
                });
                return; 
            }
        }
        // ------------------------------------------

        const dateObj = selectedDate ? new Date(selectedDate) : undefined;
        onSave(title.trim(), stateId, selectedWorker, dateObj, selectedPriority);
        
        if (!initialOpen) {
            handleReset();
        } else {
             setTitle(""); setSelectedDate(""); 
             if(onClose) onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleReset(); };
    const handleOpenCalendar = () => {
        if (dateInputRef.current) {
            try { dateInputRef.current.showPicker(); } catch (error) { dateInputRef.current.focus(); }
        }
    };

    const workerLabel = selectedWorker ? workerOptions.find(o => Number(o.value) === selectedWorker)?.label : null;
    const dateLabel = selectedDate ? formatDateShort(selectedDate) : null;
    
    const priorityOption = selectedPriority ? priorityOptions.find(o => Number(o.value) === selectedPriority) : null;
    const priorityLabel = priorityOption?.label;
    const priorityColor = (priorityOption as any)?.color || FALLBACK_COLORS[selectedPriority || 0] || "bg-gray-400";

    if (!isAdding) {
        return null;
    }

    return (
        <div 
            ref={containerRef}
            onClick={handleReactivate}
            className={cn(
                "group relative grid grid-cols-[1fr_220px_120px_auto] gap-4 items-center px-3 py-1 mt-1 rounded-md transition-all duration-200",
                isFocused 
                    ? "bg-white border border-transparent hover:border-gray-200 shadow-sm ring-1 ring-transparent focus-within:ring-blue-500/20"
                    : "bg-gray-50 border border-gray-100 opacity-60 grayscale cursor-pointer"
            )}
        >
            <div className="flex items-center gap-3 overflow-hidden pl-2">
                <div className="shrink-0 flex items-center justify-center size-5">
                    <StatusChip onlyIcon stateColor={indicatorColor} numPercPro={percentage} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isFocused} 
                    placeholder={isSubtask ? "Nueva subtarea..." : "Nombre..."} 
                    className={cn("flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0 transition-colors", !isFocused && "cursor-pointer")}
                />
            </div>

            <div className="flex items-center gap-2 overflow-hidden">
                 <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-white text-xs text-gray-600 font-medium cursor-default shrink-0">
                    {isSubtask ? (
                        <>
                           <CornerDownRight size={12} className="text-gray-400" />
                           <span>Subtarea</span>
                        </>
                    ) : (
                        <>
                           <div className="size-2.5 rounded-full border-2 border-gray-400" />
                           <span>Tarea</span>
                        </>
                    )}
                </div>

                <div className="w-px h-4 bg-gray-200 shrink-0 hidden sm:block" />
                <div className="relative group/btn flex-1 min-w-0">
                    <button disabled={!isFocused} className={cn("flex items-center gap-1.5 p-1.5 rounded transition-colors text-xs font-medium border w-full", workerLabel ? "bg-white border-gray-200 text-gray-700 pr-2" : "border-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600")} title={workerLabel || "Asignar"}>
                        {workerLabel ? (
                            <>
                                <span className="size-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] shrink-0">{workerLabel.charAt(0)}</span>
                                <span className="truncate flex-1 text-left">{workerLabel}</span>
                            </>
                        ) : <User size={16} />}
                    </button>
                    <select disabled={!isFocused} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" value={selectedWorker ?? 0} onChange={(e) => setSelectedWorker(Number(e.target.value) || undefined)}>
                        <option value="0">Sin asignar</option>
                        {workerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-start">
                 <div className="relative group/btn w-[110px]" onClick={handleOpenCalendar}>
                    <button type="button" disabled={!isFocused} className={cn("flex items-center justify-start gap-1.5 p-1.5 rounded transition-colors text-xs font-medium border w-full pointer-events-none", dateLabel ? "bg-white border-gray-200 text-gray-700 pr-2" : "border-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600")}>
                        {dateLabel ? <span>{dateLabel}</span> : <Calendar size={16} />}
                    </button>
                    <input ref={dateInputRef} disabled={!isFocused} type="date" className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 pl-2 pr-1">
                <div className="relative group/btn shrink-0">
                    <div className="p-1">
                        {selectedPriority ? (
                            <PriorityChip desc={priorityLabel} color={priorityColor} />
                        ) : (
                            <button disabled={!isFocused} className="flex items-center gap-1.5 p-1.5 rounded transition-colors text-xs font-medium border border-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                <Flag size={16} />
                            </button>
                        )}
                    </div>
                    <select disabled={!isFocused} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" value={selectedPriority ?? ""} onChange={(e) => setSelectedPriority(Number(e.target.value) || undefined)}>
                        {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={handleReset} disabled={!isFocused} className="px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 rounded border border-gray-200 bg-white transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!title.trim() || !isFocused} className={cn("flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white rounded shadow-sm transition-all whitespace-nowrap", (title.trim() && isFocused) ? "bg-[#5E3BEE] hover:bg-[#4b2fbe]" : "bg-gray-300 cursor-not-allowed")}>
                        Guardar <CornerDownLeft size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
}