import { useSalesWorkerOptions } from "@/sharedKernel";
import React, { useState, useEffect } from "react";

type Props = {
  formId: string;
  defaultValues: { workerId?: number[] };
  onSubmit: (data: { requeredSsoma: boolean; workerId: number[] }) => void;
};

export function SsomaForm({ formId, defaultValues, onSubmit }: Props) {
  const [workerId, setWorkerId] = useState<number[]>(defaultValues.workerId ?? []);
  const [search, setSearch] = useState(""); 
  const { data: workerOptions, isLoading } = useSalesWorkerOptions();

  useEffect(() => {
    setWorkerId(defaultValues.workerId ?? []);
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      requeredSsoma: workerId.length > 0,
      workerId: workerId,
    });
  };

  const toggleWorker = (id: number) => {
    setWorkerId((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const filteredWorkers = workerOptions?.items?.filter((w: any) =>
    w.label.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Seleccione los Especialistas SSOMA
        </label>

        <input
          type="text"
          placeholder="Buscar especialista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto p-1 pr-2">
          {isLoading ? (
            <p className="col-span-full text-sm text-gray-500 text-center py-4">Cargando especialistas...</p>
          ) : filteredWorkers.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500 text-center py-4">No se encontraron resultados.</p>
          ) : (
            filteredWorkers.map((worker: any) => {
              const id = Number(worker.value);
              const isSelected = workerId.includes(id);

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => toggleWorker(id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`size-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-xs uppercase transition-colors ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {worker.label.charAt(0)}
                  </div>
                  <span
                    className={`text-sm font-medium truncate ${
                      isSelected ? "text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {worker.label}
                  </span>
                  {isSelected && (
                    <svg className="ml-auto size-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </form>
  );
}