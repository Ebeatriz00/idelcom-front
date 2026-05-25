import type { OpportunitiesUploadNewVerDto } from "@/application";
import { validateQuotationExcel } from "@/infrastructure";
import { uploadByArchiveType } from "@/sharedKernel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { RHFFileUpload } from "../changeState/form/RHFFileUpload";
import { UploadProgress } from "../changeState/opporChangeStateForm";
import { RHFTextarea } from "../form/fields";
import { mapToFormQuotationNewVer } from "./form/mapToFormQuotationNewVer";
import {
  createSchemaQuotation,
  type FormQuotationVerNew,
} from "./form/shemaQuotation";

type Props = {
  defaultValues?: Partial<OpportunitiesUploadNewVerDto>;
  onSubmit: (dto: OpportunitiesUploadNewVerDto) => void;
  saving?: boolean;
  uploadPct?: number;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  loadingDetail?: boolean;
};

function buildDto(
  vals: FormQuotationVerNew,
  defaults: Partial<OpportunitiesUploadNewVerDto>,
): OpportunitiesUploadNewVerDto {
  return {
    linkToken: (vals.linkToken ?? defaults?.linkToken ?? "").trim(),
    opporNumber: vals.opporNumber ?? defaults?.opporNumber,
    businessId: defaults?.businessId ?? 0,
    usersBy: defaults?.usersBy ?? 0,

    proposalComment: vals.proposalComment ?? defaults?.proposalComment ?? "",
    fileTitle: vals.fileTitle ?? defaults?.fileTitle ?? "",
    excelFile: vals.excelFile ?? defaults?.excelFile,

    relativePath: vals.relativePath ?? defaults?.relativePath ?? "",
    archiveType: vals.archiveType ?? defaults?.archiveType ?? "",
    fileUrl: vals.fileUrl ?? defaults?.fileUrl ?? "",
  };
}

function formatValidationError(error: {
  sheet: string;
  row?: number | null;
  column?: string | null;
  message: string;
}) {
  const location = [
    error.sheet,
    error.row != null ? `fila ${error.row}` : null,
    error.column ? `columna ${error.column}` : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return location ? `${location}: ${error.message}` : error.message;
}

export function OpporQuotationNewVerForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  loadingDetail = false,
}: Props) {
  const schema = useMemo(() => createSchemaQuotation(), []);
  const { control, handleSubmit, reset, setError, clearErrors, formState } =
    useForm<FormQuotationVerNew>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: mapToFormQuotationNewVer(defaultValues),
    });
  const { errors, isValid, isSubmitting } = formState;
  useEffect(() => {
    reset(mapToFormQuotationNewVer(defaultValues));
  }, [defaultValues, reset]);

  const excelFile = useWatch({ control, name: "excelFile" });
  const [uploadPctLocal, setUploadPctLocal] = useState(0);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelWarnings, setExcelWarnings] = useState<string[]>([]);

  useEffect(() => {
    setExcelErrors([]);
    setExcelWarnings([]);
  }, [excelFile]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(
        async (vals) => {
          const dto = buildDto(vals, defaultValues ?? {});
          if (!vals.excelFile) {
            setExcelErrors([]);
            setExcelWarnings([]);
            setError("excelFile", {
              type: "custom",
              message: "Debes subir el archivo de la versión de la cotización.",
            });
            return;
          }

          clearErrors("excelFile");
          setExcelErrors([]);
          setExcelWarnings([]);

          if (vals.excelFile instanceof File) {
            if (!vals.opporNumber) {
              setError("opporNumber", {
                type: "custom",
                message: "El número de oportunidad es requerido.",
              });
              return;
            }

            const validation = await validateQuotationExcel(vals.excelFile);

            if (!validation.isValid) {
              const messages = validation.errors.length
                ? validation.errors.map(formatValidationError)
                : ["El Excel no cumple con el formato requerido."];

              setExcelErrors(messages);
              setExcelWarnings([]);
              setError("excelFile", {
                type: "custom",
                message: "Corrige los errores del Excel antes de continuar.",
              });
              return;
            }

            if (validation.warnings.length > 0) {
              setExcelWarnings(validation.warnings);
            }

            const rootFolderName = "OPORTUNIDADES";
            const year = String(new Date().getFullYear());
            const baseSegments: string[] = [year, rootFolderName];
            const folderKey = "PRESUPUESTAL/CLIENTES";
            //const archiveType = "CLEINTES";

            const up = await uploadByArchiveType(
              vals.excelFile,
              vals.opporNumber,
              folderKey,
              {
                strategy: "same",
                baseSegments,
                onProgress: (pct: number) => setUploadPctLocal(pct),
              },
            );
            dto.fileTitle = up.fileName;
            dto.fileUrl = up.url;
            dto.relativePath = up.relativePath;
            dto.archiveType = "CLIENTES";
          }
          onSubmit(dto);
        },
        (e) => console.warn("Errores del formulario:", e),
      )}
      className="space-y-5"
    >
      <div className="col-span-full lg:col-span-6 min-w-0">
        <div>
          <RHFFileUpload<FormQuotationVerNew>
            name="excelFile"
            control={control}
            label="Excel de cotización"
            accept=".xlsx,.xls"
            disabled={saving || loadingDetail}
            error={errors.excelFile?.message as string | undefined}
            helperText="Adjunta el Excel para generar la cotización automáticamente."
          />

          {saving && !!excelFile && (
            <div className="mt-3">
              <UploadProgress pct={uploadPctLocal} />
            </div>
          )}

          {excelErrors.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <div className="font-semibold">
                Errores encontrados en el Excel:
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {excelErrors.map((message, idx) => (
                  <li key={`${message}-${idx}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {excelWarnings.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <div className="font-semibold">
                Advertencias encontradas en el Excel:
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {excelWarnings.map((message, idx) => (
                  <li key={`${message}-${idx}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <RHFTextarea<FormQuotationVerNew>
            name="proposalComment"
            control={control}
            label="Descripción detallada"
            placeholder="Describe el motivo..."
            rows={2}
            maxLength={450}
            showCount
          />
        </div>
      </div>
      {showActions && (
        <div className="col-span-full flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={saving || isSubmitting || !isValid}
          >
            {saving || isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
