import { INPUT_ACCEPT } from "@/sharedKernel";
import { UploadCloud } from "lucide-react";
import React from "react";

type Props = {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  canAdd: boolean;
  currentFolderLabel?: string;
  comment: string;
  uploadProgress: number | null;
  uploadLabel?: string | null;
  setComment: (s: string) => void;
  busy: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFiles: (files: FileList | null) => Promise<void>;
};

export function UploadZone({
  dragOver,
  setDragOver,
  onDrop,
  canAdd,
  currentFolderLabel,
  comment,
  setComment,
  busy,
  uploadProgress,
  uploadLabel,
  inputRef,
  onFiles,
}: Props) {
  return (
    <div
      className={`rounded-xl border-2 border-dashed ${
        dragOver ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50"
      } p-4 flex flex-col gap-4`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <fieldset className="w-full">
        <legend className="text-xs font-medium text-gray-700 mb-2">
          Comentario del archivo
          {currentFolderLabel && (
            <span className="ml-1 text-[10px] font-normal text-gray-500">
              (Carpeta: {currentFolderLabel})
            </span>
          )}
        </legend>

        <div className="mt-1">
          <textarea
            id="file-comment"
            rows={5}
            value={comment}
            maxLength={1500}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe una breve descripción..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {1500 - (comment?.length ?? 0)} restantes
          </p>
        </div>
      </fieldset>

      <hr className="my-2 border-gray-200" />

      {canAdd ? (
        <div className="flex items-center justify-center">
          <input
            ref={inputRef}
            id="file-input"
            accept={INPUT_ACCEPT}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <label
            htmlFor="file-input"
            className={`inline-flex items-center gap-2 px-9 py-2 rounded-lg text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-100 cursor-pointer ${
              busy ? "opacity-60 pointer-events-none" : ""
            }`}
            title={
              currentFolderLabel
                ? `Subir archivos a ${currentFolderLabel}`
                : "Seleccionar archivos"
            }
          >
            <UploadCloud className="size-4" />
            Seleccionar archivos
          </label>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
          No tienes permiso para subir archivos en esta carpeta
          {currentFolderLabel && (
            <>
              {" "}
              (<span className="font-semibold">{currentFolderLabel}</span>)
            </>
          )}
          .
        </div>
      )}
      {uploadProgress !== null && (
        <div className="mt-3 space-y-1">
          {uploadLabel && (
            <p className="text-xs text-gray-600 truncate">{uploadLabel}</p>
          )}
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-amber-500 transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 text-right">
            {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
