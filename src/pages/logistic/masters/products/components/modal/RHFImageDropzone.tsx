import Dropzone from "@/layouts/presentation/dropZone";
import { cn, toRelativePathFromPublic } from "@/sharedKernel";
import { ImageIcon, Plus } from "lucide-react";
import { Controller } from "react-hook-form";
import type { Control, FieldPath } from "react-hook-form";
import type {
  ProductImageFormValue,
  ProductsUpsertFormValues,
} from "../../utils/products.schema";

interface RHFImageDropzoneProps {
  name: FieldPath<ProductsUpsertFormValues>;
  control: Control<ProductsUpsertFormValues>;
  label: string;
  disabled?: boolean;
}

function getFileTitle(fileUrl: string) {
  return decodeURIComponent(
    fileUrl.split(/[\\/]/).pop()?.split("?")[0] || "imagen",
  );
}

export function RHFImageDropzone({
  name,
  control,
  label,
  disabled,
}: RHFImageDropzoneProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700">{label}</label>
      </div>
      
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const images = Array.isArray(field.value)
            ? (field.value as ProductImageFormValue[])
            : [];

          const addImage = (fileUrl?: string) => {
            if (!fileUrl) return;
            const nextImage: ProductImageFormValue = {
              fileUrl,
              fileTitle: getFileTitle(fileUrl),
              relativePath: toRelativePathFromPublic(fileUrl) ?? "",
            };
            field.onChange([...images, nextImage]);
          };

          const removeImage = (index: number) => {
            field.onChange(images.filter((_, i) => i !== index));
          };

          const replaceImage = (index: number, fileUrl?: string) => {
            if (!fileUrl) {
              removeImage(index);
              return;
            }

            const nextImage: ProductImageFormValue = {
              fileUrl,
              fileTitle: getFileTitle(fileUrl),
              relativePath: toRelativePathFromPublic(fileUrl) ?? "",
            };

            field.onChange(
              images.map((image, imageIndex) =>
                imageIndex === index ? nextImage : image,
              ),
            );
          };

          return (
            <div className="space-y-4">
              <div
                className={cn(
                  "group relative flex min-h-[172px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50",
                  fieldState.error ? "border-rose-300 bg-rose-50/40" : "",
                  disabled ? "pointer-events-none opacity-50" : "",
                )}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:text-blue-600 group-hover:ring-blue-200">
                    <Plus className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Haz clic para subir o arrastra imagenes</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG o WEBP (Máx. 2MB)</p>
                  </div>
                </div>
                
                <div className="absolute inset-0 opacity-0">
                  <Dropzone
                    value=""
                    onChange={addImage}
                    carpeta="PRODUCTS"
                    entityId="NEW"
                    size={160}
                    noCrop
                    multiple
                  />
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image.fileUrl}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-2 transition-colors hover:border-blue-200"
                    >
                      <Dropzone
                        value={image.fileUrl}
                        onChange={(fileUrl) => replaceImage(index, fileUrl)}
                        carpeta="PRODUCTS"
                        entityId="NEW"
                        size={132}
                        noCrop
                      />
                      <p className="mt-2 truncate px-1 text-[10px] font-medium text-slate-500">
                        {image.fileTitle}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && !fieldState.error && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-blue-800">
                  <ImageIcon className="size-4" />
                  <span className="text-xs font-semibold">
                    {images.length} {images.length === 1 ? 'imagen lista' : 'imagenes listas'} para registrar
                  </span>
                </div>
              )}

              {fieldState.error && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <span className="size-1.5 rounded-full bg-rose-600" />
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
