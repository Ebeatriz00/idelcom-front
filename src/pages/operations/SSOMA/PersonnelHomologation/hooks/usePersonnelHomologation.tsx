import type { HomologationPersonnelRequestDto } from "@/application";
import {
  closeAlert,
  showApiError,
  showLoading,
  useCreatePersonnelHomologation,
} from "@/sharedKernel";
import { useMemo, useState } from "react";
import type { PersonnelHomologationFormDefaultValues } from "../utils/TypesPersonnel";

export function usePersonnelHomologationFormModal() {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] =
    useState<PersonnelHomologationFormDefaultValues>({
      homologationPersonnel: {},
      documents: [],
    });

  const createMut = useCreatePersonnelHomologation();

  const defaultValues = useMemo<PersonnelHomologationFormDefaultValues>(() => {
    return initialData;
  }, [initialData]);

  function openCreate(overrides?: PersonnelHomologationFormDefaultValues) {
    setInitialData(
      overrides ?? {
        homologationPersonnel: {},
        documents: [],
      },
    );
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setInitialData({
      homologationPersonnel: {},
      documents: [],
    });
  }

  async function submit(dto: HomologationPersonnelRequestDto) {
    try {
      showLoading("Guardando homologación...");
      await createMut.mutateAsync(dto);
      close();
    } catch (err) {
      await showApiError(err, "No se pudo guardar la homologación.");
    } finally {
      closeAlert();
    }
  }
  const saving = createMut.isPending;
  return {
    open,
    defaultValues,
    openCreate,
    close,
    submit,
    saving,
  };
}
