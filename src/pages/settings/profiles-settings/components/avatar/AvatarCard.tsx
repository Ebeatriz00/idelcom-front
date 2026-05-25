// components/avatar/AvatarDropzoneCard.tsx
import Dropzone from "@/layouts/presentation/dropZone";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";

export type AvatarDropzoneCardProps = {
  value: string | undefined; // URL/clave actual
  onChange: Dispatch<SetStateAction<string | undefined>>; // lo que pide tu Dropzone
  onFileSelected?: (file: File) => void; // opcional: avisar al padre el File
  size?: number;
  carpeta?: string;
  entityId?: number | string;
  title?: string;
  maxSizeMB?: number;
  className?: string;
  accept?: string;
  // opcional: construir URL de preview cuando el Dropzone/servidor devuelve solo filename
  buildPreviewUrl?: (val: string) => string;
};

export function AvatarDropzoneCard({
  value,
  onChange,
  onFileSelected,
  size = 220,
  carpeta = "USERS",
  entityId = 0,
  title = "Foto de perfil",
  maxSizeMB = 2,
  className = "",
  accept = "image/*",
  buildPreviewUrl,
}: AvatarDropzoneCardProps) {
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickFile = () => inputRef.current?.click();

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) {
      alert("Selecciona una imagen válida (PNG/JPG)");
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`La imagen supera ${maxSizeMB}MB`);
      return;
    }
    setFileInfo(f);
    onFileSelected?.(f);

    // Para preview inmediato desde input manual usamos dataURL:
    const dataUrl = await fileToDataUrl(f);
    onChange(dataUrl); // ✅ SOLO string/undefined
  };

  return (
    <section className={"md:col-span-1 " + className}>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Arrastra una imagen o selecciónala desde tu equipo.
        </p>

        {/* Dropzone propio (ya maneja onChange: SetStateAction<string|undefined>) */}
        <div className="mt-4 flex items-start justify-center">
          <Dropzone
            value={value}
            onChange={(next) => {
              // next puede ser string | undefined | (prev)=>string|undefined
              if (typeof next === "function") {
                // pasar función directamente es válido
                onChange(next);
              } else {
                // si necesitas transformar filenames a URL, hazlo aquí:
                onChange(buildPreviewUrl ? buildPreviewUrl(next ?? "") : next);
              }
            }}
            size={size}
            carpeta={carpeta}
            entityId={entityId ?? 0}
          />
        </div>

        {/* Botón alternativo para abrir selector del sistema */}
        <div className="flex items-start justify-center">
          <div className="mt-3 text-sm  text-gray-600">
            <button
              type="button"
              onClick={pickFile}
              className="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
            >
              Elegir archivo
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="mt-2 text-xs text-gray-400">
              PNG, JPG. Máx {maxSizeMB}MB.
            </p>
          </div>
        </div>

        {/* (Opcional) info del archivo elegido por input */}
        {fileInfo && (
          <p className="mt-2 text-[11px] text-gray-500">
            Archivo: <span className="font-medium">{fileInfo.name}</span> (
            {(fileInfo.size / 1024).toFixed(0)} KB)
          </p>
        )}
      </div>
    </section>
  );
}
