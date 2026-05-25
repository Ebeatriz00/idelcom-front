import {
  ensureFolderLocalPath,
  localFileUrl,
  uploadToLocalDrive,
} from "@/sharedKernel";
import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
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
  c.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, side, side);
  return c;
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return c;
}

function canvasToWebpBlob(c: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("No se pudo crear el Blob WebP")),
      "image/webp",
      quality
    );
  });
}

async function uploadPhotoToLocal(
  blob: Blob,
  pathSegments: string[]
): Promise<string> {
  const file = new File([blob], "foto.webp", { type: "image/webp" });
  await ensureFolderLocalPath(pathSegments);
  const up = await uploadToLocalDrive(
    file,
    { segments: pathSegments },
    {
      strategy: "timestamp",
      prefix: "",
      dedup: "hash",
      onDuplicate: "return",
    }
  );
  return localFileUrl(up.relativePath);
}

export default function Dropzone({
  value,
  onChange,
  carpeta,
  entityId,
  size = 200,
  noCrop = false,
  multiple = false,
  maxFileBytes = MAX_UPLOAD_BYTES,
}: {
  value?: string;
  onChange: (value?: string) => void;
  carpeta: string;
  entityId: number | string;
  size?: number;
  noCrop?: boolean;
  multiple?: boolean;
  maxFileBytes?: number;
}) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setError(null);


      const filesToProcess = multiple ? accepted : [accepted[0]];

      for (const file of filesToProcess) {
        try {
          const img = await fileToImage(file);
          const canvas = noCrop ? imageToCanvas(img) : cropToSquare(img);

          const qualities = [0.9, 0.8, 0.7, 0.6, 0.5];
          let finalBlob: Blob | null = null;
          for (const q of qualities) {
            const b = await canvasToWebpBlob(canvas, q);
            if (b.size <= MAX_IMAGE_BYTES || q === qualities.at(-1)) {
              finalBlob = b;
              break;
            }
          }

          if (finalBlob) {
            const year = new Date().getFullYear().toString();
            const publicUrl = await uploadPhotoToLocal(finalBlob, [
              year,
              carpeta.toUpperCase(),
              String(entityId),
            ]);

            onChange(publicUrl);
          }
        } catch (err) {
          console.error("Error procesando archivo:", file.name, err);
        }
      }
    },
    [onChange, carpeta, entityId, noCrop, multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: maxFileBytes,
    multiple: multiple,
    onDrop,
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0];
      if (firstError?.code === "file-too-large") {
        setError(
          `La imagen no debe superar ${Math.round(maxFileBytes / 1024 / 1024)}MB.`,
        );
        return;
      }
      setError("Solo se aceptan imagenes PNG, JPG o WebP.");
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-gray-400 transition bg-white ${
        noCrop ? "rounded-xl" : "rounded-full"
      }`}
      style={{ width: size, height: size }}
    >
      <input {...getInputProps()} />
      {value ? (
        <>
          <img
            src={value}
            alt="preview"
            className={`w-full h-full ${
              noCrop ? "object-contain" : "object-cover"
            }`}
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-center text-[11px] font-medium text-white">
            Cambiar
          </span>
        </>
      ) : (
        <div className="text-gray-400 text-sm flex flex-col items-center text-center px-2">
          <Upload className="size-6 mb-1" />
          {isDragActive ? "Suelta" : "Subir"}
          <span className="text-[11px] mt-1">
            PNG/JPG/WebP - max {Math.round(maxFileBytes / 1024 / 1024)}MB
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
      {error && (
        <p className="absolute inset-x-2 bottom-2 rounded bg-white/95 px-2 py-1 text-[11px] font-medium text-red-600 shadow">
          {error}
        </p>
      )}
    </div>
  );
}
