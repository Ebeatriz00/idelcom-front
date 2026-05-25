import { ChevronLeft, ChevronRight, Plus, Files, Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { PersonnelHomologationFormValues } from "../../utils/personnelHomologation.schema";
import { PersonnelHomologationDocumentCard } from "./PersonnelHomologationDocumentCard";
import { createEmptyDocument } from "./PersonnelHomologationForm.shared";

type Props = {
  completedDocs: number;
  readyDocs: number;
  homologationScopeId: number | null;
  canAddDocuments: boolean;
  fields: FieldArrayWithId<
    PersonnelHomologationFormValues,
    "documents",
    "id"
  >[];
  shouldLoadByWorkerRequirements: boolean;
  byWorkerLoading: boolean;
  onAppend: (
    value: PersonnelHomologationFormValues["documents"][number],
  ) => void;
  documentCardProps: Omit<
    ComponentProps<typeof PersonnelHomologationDocumentCard>,
    "index" | "onRemove"
  >;
  onRemove: (index: number) => void;
  workerName?: string;
  operationLabel?: string;
};

const PAGE_SIZE = 5;

export function PersonnelHomologationDocumentsSection({
  completedDocs,
  readyDocs,
  homologationScopeId,
  canAddDocuments,
  fields,
  shouldLoadByWorkerRequirements,
  byWorkerLoading,
  onAppend,
  documentCardProps,
  onRemove,
  workerName,
  operationLabel,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [previousReadyDocs, setPreviousReadyDocs] = useState(readyDocs);

  const isDisabled = !canAddDocuments;

  const processedFields = useMemo(() => {
    const isGeneralScope = Number(homologationScopeId) === 1;

    const all = fields.map((field, index) => {
      const docValue = documentCardProps.watch(`documents.${index}`);

      const isComplete =
        Boolean(docValue?.requirementId) &&
        Boolean(docValue?.fileName?.trim()) &&
        Boolean(docValue?.filePath?.trim()) &&
        !docValue?.localUploadToken;

      return { field, index, isComplete };
    });

    const filtered = showAll
      ? all
      : isGeneralScope
        ? all
        : all.filter((item) => !item.isComplete);

    return filtered.sort((a, b) => {
      if (a.isComplete === b.isComplete) return a.index - b.index;
      return a.isComplete ? 1 : -1;
    });
  }, [fields, documentCardProps, showAll, homologationScopeId]);

  const totalPages = Math.max(1, Math.ceil(processedFields.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (readyDocs > previousReadyDocs) {
      setShowAll(true);
      setCurrentPage(totalPages);
    }
    setPreviousReadyDocs(readyDocs);
  }, [readyDocs, previousReadyDocs, totalPages]);

  const paginatedFields = processedFields.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleAddDocument = () => {
    onAppend(createEmptyDocument());
    const nextTotalPages = Math.ceil((processedFields.length + 1) / PAGE_SIZE);
    setCurrentPage(nextTotalPages);
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 px-1 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Files className="size-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {showAll ? "Todos los documentos" : "Requisitos pendientes"}
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Mostrando {processedFields.length} de {fields.length} requisitos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(completedDocs > 0 || readyDocs > 0) && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                showAll
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {showAll ? (
                <>
                  <EyeOff className="size-3.5" /> Ocultar completados
                </>
              ) : (
                <>
                  <Eye className="size-3.5" /> Ver completados ({completedDocs})
                </>
              )}
            </button>
          )}

          {processedFields.length > PAGE_SIZE && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span className="text-slate-900">{currentPage}</span> /{" "}
                {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          <div className="group relative inline-block">
            <button
              type="button"
              disabled={isDisabled}
              onClick={handleAddDocument}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus className="size-4" />
              Nuevo documento
            </button>
          </div>
        </div>
      </div>

      {shouldLoadByWorkerRequirements && byWorkerLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-sm font-medium text-blue-700">
            Sincronizando requisitos del trabajador...
          </p>
        </div>
      )}

      {processedFields.length === 0 && !byWorkerLoading && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-200">
            <Files className="size-8 text-emerald-300" />
          </div>
          <p className="text-base font-bold text-emerald-700">Todo al dia</p>
          <p className="mt-1 max-w-xs mx-auto text-sm font-medium text-emerald-600/70">
            No hay requisitos pendientes por cargar para este trabajador.
          </p>
          {(completedDocs > 0 || readyDocs > 0) && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                <Eye className="size-4" />
                Revisar completados
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {paginatedFields.map(({ field, index }) => (
          <PersonnelHomologationDocumentCard
            key={field.id}
            index={index}
            onRemove={onRemove}
            workerName={workerName}
            operationLabel={operationLabel}
            homologationScopeId={Number(homologationScopeId ?? 0)}
            {...documentCardProps}
          />
        ))}
      </div>

      {processedFields.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-[11px] font-medium text-slate-400">
            Mostrando{" "}
            <span className="text-slate-700">
              {(currentPage - 1) * PAGE_SIZE + 1}
            </span>{" "}
            al{" "}
            <span className="text-slate-700">
              {Math.min(currentPage * PAGE_SIZE, processedFields.length)}
            </span>{" "}
            de{" "}
            <span className="text-slate-700">{processedFields.length}</span>{" "}
            pendientes
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
