import type { PersonnelHomologationListItemDto } from "@/application";
import { Breadcrumb } from "@/layouts";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionDetailPersonnelHomologation } from "./components/Detail/SectionDetailPersonnelHomologation";
import { AsidePersonnelHomologation } from "./components/Tables/PersonnelHomologationTable";

export default function PersonnelHomologation() {
  const [selectedPersonnel, setSelectedPersonnel] =
    useState<PersonnelHomologationListItemDto | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const selectedPersonnelId = useMemo(() => {
    const rawSelectedId = searchParams.get("personnelId");
    if (!rawSelectedId) return null;

    const parsedSelectedId = Number(rawSelectedId);
    return Number.isFinite(parsedSelectedId) ? parsedSelectedId : null;
  }, [searchParams]);

  const selectedWorkerId = useMemo(() => {
    const raw = searchParams.get("workerId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const updateSearchParam = useCallback(
    (key: string, value?: string | number | null) => {
      const next = new URLSearchParams(searchParams);

      if (value === null || value === undefined || `${value}`.trim() === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateSearchParam("search", value);
    },
    [updateSearchParam],
  );

  const handleSelect = useCallback(
    (personnel: PersonnelHomologationListItemDto) => {
      setSelectedPersonnel(personnel);
      const next = new URLSearchParams(searchParams);
      const personnelRecord = personnel as Partial<
        PersonnelHomologationListItemDto & Record<string, unknown>
      >;
      const workerId =
        typeof personnelRecord.workerId === "number"
          ? personnelRecord.workerId
          : Number(
              personnelRecord.workerId ||
                personnelRecord.personnelOperationsId ||
                0,
            ) || null;

      const entries = [
        ["personnelId", personnel.personnelOperationsId ?? null],
        ["workerId", workerId],
      ] as const;

      for (const [key, value] of entries) {
        if (value === null || value === undefined || `${value}`.trim() === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <div className="relative flex min-h-[80vh] flex-col space-y-4 p-3 sm:p-4">
      <Breadcrumb
        items={[
          { label: "SSOMA", href: "#" },
          { label: "Personal de Operaciones", current: true },
        ]}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <AsidePersonnelHomologation
          selectedId={selectedPersonnelId}
          onSelect={handleSelect}
          search={search}
          setSearch={handleSearchChange}
        />

        <section className="h-full min-w-0">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionDetailPersonnelHomologation
                selectedId={selectedPersonnelId ?? undefined}
                selectedPersonnel={selectedPersonnel ?? undefined}
                selectedWorkerId={selectedWorkerId ?? undefined}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
