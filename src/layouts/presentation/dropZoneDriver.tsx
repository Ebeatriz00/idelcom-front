// Dropzone.tsx

import {
  driveImageUrl,
  ensureFolderPath,
  getDriveAccessToken,
  uploadToDrive,
} from "@/sharedKernel";
import { Upload, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    // Para object URLs no hace falta crossOrigin, pero no hace daño:
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function cropToSquare(img: HTMLImageElement): HTMLCanvasElement {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = Math.floor((img.naturalWidth - side) / 2);
  const sy = Math.floor((img.naturalHeight - side) / 2);
  const c = document.createElement("canvas");
  c.width = c.height = side;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
  return c;
}

function canvasToWebpBlob(c: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo crear el Blob WebP")),
      "image/webp",
      quality
    );
  });
}

async function uploadPhoto(
  blob: Blob,
  pathSegments: string[]
): Promise<string> {
  const file = new File([blob], `foto_${Date.now()}.webp`, {
    type: "image/webp",
  });
  const token = await getDriveAccessToken();

  // 👇 crea/obtiene toda la ruta dinámica
  const folderId = await ensureFolderPath(token, pathSegments);

  const { id } = await uploadToDrive(token, file, folderId);
  return driveImageUrl(id); // URL que guardas en BD
}

export default function DropzoneDriver({
  value,
  onChange,
  carpeta,
  entityId,
  size = 200,
}: {
  value?: string;
  onChange: React.Dispatch<React.SetStateAction<string | undefined>>;
  carpeta: string;
  entityId: number | string;
  size?: number;
}) {
  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      try {
        // 1) Cargar y recortar a cuadrado
        const img = await fileToImage(file);
        const square = cropToSquare(img);

        // 2) Re-encode a WebP hasta ≤ 1MB
        const qualities = [0.9, 0.8, 0.7, 0.6, 0.5];
        let finalBlob: Blob | null = null;
        for (const q of qualities) {
          const blob = await canvasToWebpBlob(square, q);
          if (
            blob.size <= MAX_IMAGE_BYTES ||
            q === qualities[qualities.length - 1]
          ) {
            finalBlob = blob;
            break;
          }
        }
        if (!finalBlob) {
          alert("No se pudo procesar la imagen.");
          return;
        }

        // 3) ⬇️ AQUÍ usamos el helper (sin duplicar lógica)
        const publicUrl = await uploadPhoto(finalBlob, [
          "IDELCOM_FOTOS",
          carpeta.toUpperCase(),
          String(entityId),
        ]);

        onChange(publicUrl);
      } catch (err) {
        console.error(err);
        alert("Error al subir la imagen.");
      }
    },
    [onChange, carpeta, entityId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-gray-400 transition bg-white"
      style={{ width: size, height: size }}
    >
      <input {...getInputProps()} />
      {value ? (
        <img src={value} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-400 text-sm flex flex-col items-center text-center px-2">
          <Upload className="size-6 mb-1" />
          {isDragActive ? "Suelta la imagen" : "Subir foto"}
          <span className="text-[11px] mt-1">
            (máx 1MB, se recorta y convierte a WebP)
          </span>
        </div>
      )}
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:bg-white"
        >
          <X className="size-4 text-gray-700" />
        </button>
      )}
    </div>
  );
}
