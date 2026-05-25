import type {
  AssignmentTypeByIdDto,
  AssignmentTypeResponseDto,
  AssignmentTypeStatusDto,
  AssignmentTypeUpsertDto,
  OptionItem,
  PagedSelect,
  Paginated,
} from "@/application";
import {
  fetchAssignmentSelect,
  fetchAssignmentTypeById,
  fetchAssignmentTypesList,
  fetchCreateAssignmentType,
  fetchUpdateAssignmentType,
  fetchUpdateAssignmentTypeStatus,
} from "@/infrastructure";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qkAssignmentType } from "./keys/qkAssignmentType";

export function useAssignmentTypeList(
  pageIndex: number,
  pageSize: number,
  search?: string,
) {
  const s = (search ?? "").trim();
  return useQuery<Paginated<AssignmentTypeResponseDto>>({
    queryKey: qkAssignmentType.list(pageIndex, pageSize, s),
    queryFn: () => fetchAssignmentTypesList(s, pageIndex + 1, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useAssignmentTypeOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkAssignmentType.select(page, s, pageSize),
    queryFn: () => fetchAssignmentSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useAssignmentTypeById(id?: number | null) {
  return useQuery<AssignmentTypeByIdDto>({
    queryKey:
      id != null ? qkAssignmentType.byId(id ?? -1) : qkAssignmentType.byId(-1),
    queryFn: () => fetchAssignmentTypeById(id as number),
    placeholderData: (prev) => prev,
    enabled: id != null,
    staleTime: 60_000,
  });
}

export function useAssignmentTypeMutations() {
  const queryClient = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<AssignmentTypeUpsertDto, "assignmentTypeId">
  >({
    mutationFn: fetchCreateAssignmentType,
    retry: false,
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await queryClient.invalidateQueries({
          queryKey: qkAssignmentType.lists(),
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo crear la leads de calificación.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error creando leads de calificación.");
    },
  });

  const updateMut = useMutation<
    GlobalResponse,
    unknown,
    AssignmentTypeUpsertDto
  >({
    mutationFn: fetchUpdateAssignmentType,
    retry: false,
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: qkAssignmentType.lists() }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          vars.ssomaAssignamentTypeId
            ? queryClient.invalidateQueries({
                queryKey: qkAssignmentType.byId(vars.ssomaAssignamentTypeId),
              })
            : Promise.resolve(),
        ]);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar la oportunidad.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando oportunidad.");
    },
  });

  const statusMut = useMutation<
    GlobalResponse,
    unknown,
    AssignmentTypeStatusDto
  >({
    mutationFn: fetchUpdateAssignmentTypeStatus,
    retry: false,
    onMutate: (vars) =>
      showLoading(
        vars.status === "1"
          ? "Activando oportunidad..."
          : "Desactivando oportunidad...",
      ),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await queryClient.invalidateQueries({
          queryKey: qkAssignmentType.lists(),
          type: "active",
        });
        await showSuccess("Éxito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo cambiar el estado.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error al cambiar el estado.");
    },
  });

  return { createMut, updateMut, statusMut };
}
