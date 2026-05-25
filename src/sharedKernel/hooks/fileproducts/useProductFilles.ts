import type { Paginated } from "@/application";
import {
  createProductFiles,
  deleteProductFile,
  fetchProductFiles,
  type ProductFileResponseDto,
} from "@/infrastructure/api-clients/fileproducts/productFiles.client";
import {
  closeAlert,
  showApiError,
  showLoading,
  showSuccess,
} from "@/sharedKernel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkProductFiles = {
  all: ["product-files"] as const,
  list: (productsId: number) =>
    [...qkProductFiles.all, "list", productsId] as const,
};

export function useProductFilesList(productsId: number) {
  return useQuery<Paginated<ProductFileResponseDto>>({
    queryKey: qkProductFiles.list(productsId),
    queryFn: () => fetchProductFiles(productsId),
    enabled: !!productsId,
  });
}

export function useProductFilesMutations() {
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: createProductFiles,
    onMutate: () => showLoading("Subiendo imagenes..."),
    onSuccess: async (res, vars) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Exito", "Imagenes subidas correctamente.");
        await qc.invalidateQueries({
          queryKey: qkProductFiles.list(vars.productsId),
        });
      } else {
        await showApiError({ response: { data: res } }, "Error al subir.");
      }
    },
    onError: (e) => {
      closeAlert();
      showApiError(e, "Error al subir imagenes.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteProductFile,
    onMutate: () => showLoading("Imagen eliminada..."),
    onSuccess: async (res) => {
      closeAlert();
      if (res.status === 1) {
        await showSuccess("Exito", res.message);
      } else {
        await showApiError(
          { response: { data: res } },
          "No se pudo eliminar la imagen.",
        );
      }
    },
    onError: async (e) => {
      closeAlert();
      await showApiError(e, "Error eliminando imagen.");
    },
    onSettled: async (_res, _err, vars) => {
      if (vars?.productsId) {
        await qc.invalidateQueries({
          queryKey: qkProductFiles.list(vars.productsId),
        });
        await qc.refetchQueries({
          queryKey: qkProductFiles.list(vars.productsId),
          type: "active",
        });
      }
      await qc.invalidateQueries({ queryKey: qkProductFiles.all });
    },
  });

  return { createMut, deleteMut };
}
