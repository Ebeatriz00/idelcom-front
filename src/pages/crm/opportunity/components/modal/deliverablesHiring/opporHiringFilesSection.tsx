import { useRef } from "react";
import type { FieldError } from "react-hook-form";
import Swal from "sweetalert2";

export type FileDestinationOption = {
  label: string;
  value: string;
};

export const DEFAULT_HIRING_OPTIONS: FileDestinationOption[] = [
  { label: "Informes", value: "INFORMES" },
  { label: "Documentación", value: "DOCUMENTACION" },
];

export type PendingHiringFile = {
  tempId: string;
  file: File;
  destination?: string;
};

export type ExistingHiringFile = {
  fileTitle: string;
  fileUrl?: string;
};

type Props = {
  files: PendingHiringFile[];
  onChange: (files: PendingHiringFile[]) => void;
  disabled?: boolean;
  error?: FieldError;
  showDestinationSelect?: boolean;
  existingFiles?: ExistingHiringFile[];
  defaultDestination?: string;
  destinationOptions?: FileDestinationOption[];
};

const makeTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

export function OpporHiringFilesSection({
  files,
  onChange,
  disabled,
  error,
  showDestinationSelect = false,
  existingFiles = [],
  defaultDestination = undefined,
  destinationOptions = DEFAULT_HIRING_OPTIONS,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pick = () => {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

    const hasExisting = existingFiles.length > 0;
    const canAddNewFiles = !hasExisting;


  const addFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const selected = Array.from(filesList);
    const validFiles: PendingHiringFile[] = [];
    const duplicates: string[] = [];

    selected.forEach((newFile) => {
      const newNameClean = newFile.name.trim().toLowerCase();

      const existsInHistory = existingFiles.some(
        (ex) => ex.fileTitle.trim().toLowerCase() === newNameClean,
      );

      const existsInCurrent = files.some(
        (f) => f.file.name.trim().toLowerCase() === newNameClean,
      );

      const existsInBatch = validFiles.some(
        (v) => v.file.name.trim().toLowerCase() === newNameClean,
      );

      if (existsInHistory || existsInCurrent || existsInBatch) {
        duplicates.push(newFile.name);
      } else {
        validFiles.push({
          tempId: makeTempId(),
          file: newFile,
          destination: defaultDestination,
        });
      }
    });

  
    if (duplicates.length > 0) {
      Swal.fire({
        title: "Archivo duplicado",
        text:
          duplicates.length === 1
            ? `El archivo "${duplicates[0]}" ya se encuentra registrado.`
            : `Se detectaron ${duplicates.length} archivos que ya existen en el registro.`,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Entendido",
      });
    }

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeByTempId = (tempId: string) => {
    onChange(files.filter((x) => x.tempId !== tempId));
  };

  const updateDestination = (tempId: string, dest: string) => {
    const updated = files.map((f) =>
      f.tempId === tempId ? { ...f, destination: dest } : f,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Archivos de soporte
          </p>
          <p className="text-xs text-gray-500">
            Formatos: PDF, Word, Excel, Imágenes, TXT.
          </p>
        </div>

        {canAddNewFiles && (
          <>
            <button
              type="button"
              onClick={pick}
              disabled={disabled}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              + Agregar archivos
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.txt"
              onChange={(e) => addFiles(e.target.files)}
              disabled={disabled}
            />
          </>
        )}
      </div>

      {existingFiles.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-sm font-medium text-gray-800">
            Archivos registrados
          </p>

          <ul className="mt-2 space-y-1">
            {existingFiles.map((x, idx) => (
              <li
                key={`${x.fileTitle}-${idx}`}
                className="flex items-center justify-between gap-2"
              >
                <p
                  className="truncate text-sm text-gray-700"
                  title={x.fileTitle}
                >
                  {x.fileTitle}
                </p>

                {x.fileUrl ? (
                  <a
                    href={x.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Ver
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sin link</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasExisting && files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 text-center">
          No hay archivos nuevos pendientes.
        </div>
      ) : (
        <ul className="space-y-2">
          {files.map(({ tempId, file, destination }) => (
            <li
              key={tempId}
              className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-gray-800"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>

              {showDestinationSelect && (
                <select
                  value={destination || ""}
                  onChange={(e) => updateDestination(tempId, e.target.value)}
                  disabled={disabled}
                  className={`block h-8 w-40 rounded-md border-gray-300 py-0 pl-2 pr-7 
                  text-[11px] font-medium text-gray-700 
                  focus:ring-0 focus:outline-none focus:border-gray-400
                  bg-gray-50 transition-all
                  ${!destination ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" disabled>
                    Seleccionar...
                  </option>

                  {destinationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => removeByTempId(tempId)}
                disabled={disabled}
                className="rounded-lg px-2 py-1 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-rose-600">{error.message}</p>}
    </div>
  );
}
