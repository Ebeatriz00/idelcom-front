import type { WorkerUpsertDto } from "@/application";
import { createWorker, updateWorker } from "@/infrastructure";
import {
  closeAlert,
  qkWorker,
  showApiError,
  showLoading,
  showSuccess,
  type GlobalResponse,
} from "@/sharedKernel";

import { useMutation, useQueryClient } from "@tanstack/react-query";

function patchListsAfterUpdate(
  qc: ReturnType<typeof useQueryClient>,
  predicate: (it: WorkerUpsertDto) => boolean,
  updater: (it: WorkerUpsertDto) => WorkerUpsertDto
) {
  const caches = qc.getQueriesData<{ items: WorkerUpsertDto[] }>({
    queryKey: qkWorker.lists(),
    exact: false,
  });

  for (const [key, data] of caches) {
    if (!data?.items) continue;
    const next = {
      ...data,
      items: data.items.map((it) => (predicate(it) ? updater(it) : it)),
    };
    qc.setQueryData(key, next);
  }
}

export const useWorkerMutations = () => {
  const qc = useQueryClient();

  const createMut = useMutation<
    GlobalResponse,
    unknown,
    Omit<WorkerUpsertDto, "workerId">
  >({
    mutationFn: createWorker,
    onMutate: () => showLoading("Registrando nuevo trabajador..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        await qc.invalidateQueries({
          queryKey: qkWorker.lists(),
          exact: false,
          refetchType: "active",
        });
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo registrar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error registrando.");
    },
  });

  const updateMut = useMutation<GlobalResponse, unknown, WorkerUpsertDto>({
    mutationFn: updateWorker,
    onMutate: () => showLoading("Actualizando trabajador..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Éxito", res.message);
        if (vars.workerId) {
          patchListsAfterUpdate(
            qc,
            (it) => it.workerId === vars.workerId,
            (it) => ({
              ...it,

              workerName: vars.workerName ?? it.workerName,
              workerLastName: vars.workerLastName ?? it.workerLastName,
              documentTypeId: vars.documentTypeId ?? it.documentTypeId,
              workerDocument: vars.workerDocument ?? it.workerDocument,

              jobTitleId: vars.jobTitleId ?? it.jobTitleId,
              areaId: vars.areaId ?? it.areaId,
              prevJob: vars.prevJob ?? it.prevJob,

              departmentId: vars.departmentId ?? it.departmentId,
              provinceId: vars.provinceId ?? it.provinceId,
              districtId: vars.districtId ?? it.districtId,
              address: vars.address ?? it.address,

              phone: vars.phone ?? it.phone,
              email: vars.email ?? it.email,

              birthDate: vars.birthDate ?? it.birthDate,
              dateEntry: vars.dateEntry ?? it.dateEntry,
              dateCes: vars.dateCes ?? it.dateCes,

              bankId: vars.bankId ?? it.bankId,
              ccBank: vars.ccBank ?? it.ccBank,
              cciBank:
                (vars as any).cciBank ?? (vars as any).ccIbank ?? it.cciBank,

              salary: vars.salary ?? it.salary,
              numberChildren: vars.numberChildren ?? it.numberChildren,
            })
          );
        }
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo actualizar."
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error actualizando.");
    },
  });

  return { createMut, updateMut };
};
