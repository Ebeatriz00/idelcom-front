import { 
  fetchClinicSelect,
  fetchClinicListItem,
  fetchClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
} from "@/infrastructure";
import type { ClinicCreateDto, ClinicUpdateDto } from "@/application";
import { useQuery, useMutation } from "@tanstack/react-query";
import { closeAlert, showApiError, showLoading, showSuccess } from "@/sharedKernel";

export function useClinicSearchOptions(
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["clinics-select-options", page, search, pageSize],
    queryFn: async () => {
      const response = await fetchClinicSelect(page, pageSize, search);
      return response;
    },
    enabled: opts?.enabled,
  });
}

export function useClinicListItem(
  page: number,
  pageSize: number,
  search?: string
) {
  return useQuery({
    queryKey: ["clinics-list", page, pageSize, search],
    queryFn: async () => {
      const response = await fetchClinicListItem(page, pageSize, search);
      return response;
    },
  });
}

export function useClinicById(clinicId: number, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: async () => {
      const response = await fetchClinicById(clinicId);
      return response;
    },
    enabled: opts?.enabled !== false && !!clinicId,
  });
}

export function useCreateClinic() {
  return useMutation({
    mutationFn: async (dto: ClinicCreateDto) => {
      showLoading("Creando clínica...");
      try {
        const res = await createClinic(dto);
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message || "Clínica creada correctamente.");
        } else {
          await showApiError({ response: { data: res } }, "No se pudo crear la clínica.");
        }
        return res;
      } catch (e) {
        closeAlert();
        await showApiError(e, "Error al crear la clínica.");
        throw e;
      }
    },
  });
}

export function useUpdateClinic() {
  return useMutation({
    mutationFn: async (dto: ClinicUpdateDto) => {
      showLoading("Actualizando clínica...");
      try {
        const res = await updateClinic(dto);
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message || "Clínica actualizada correctamente.");
        } else {
          await showApiError({ response: { data: res } }, "No se pudo actualizar la clínica.");
        }
        return res;
      } catch (e) {
        closeAlert();
        await showApiError(e, "Error al actualizar la clínica.");
        throw e;
      }
    },
  });
}

export function useDeleteClinic() {
  return useMutation({
    mutationFn: async (clinicId: number) => {
      showLoading("Actualizando estado...");
      try {
        const res = await deleteClinic(clinicId);
        closeAlert();
        if (res.status === 1) {
          await showSuccess("Éxito", res.message || "Estado actualizado correctamente.");
        } else {
          await showApiError({ response: { data: res } }, "No se pudo actualizar el estado.");
        }
        return res;
      } catch (e) {
        closeAlert();
        await showApiError(e, "Error al actualizar el estado de la clínica.");
        throw e;
      }
    },
  });
}
