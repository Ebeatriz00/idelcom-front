import http from "@/infrastructure";
import { toRelativePathFromPublic } from "@/sharedKernel/utils/localDrive";

export interface ProductFileResponseDto {
  fileTrackingProductsId: number;
  productsId: number;
  fileUrl?: string;
  fileTitle?: string;
  relativePath?: string;
}

export interface ProductFileCreateDto {
  productsId: number;
  files: string[];
}

export interface ProductFileDeleteDto {
  fileTrackingProductsId: number;
  productsId: number;
}

const BASE_URL = "/ProductFiles";

function getFileTitle(fileUrl: string) {
  return decodeURIComponent(fileUrl.split(/[\\/]/).pop()?.split("?")[0] || "archivo");
}

export async function fetchProductFiles(productsId: number, page = 1, pageSize = 100) {
  if (!productsId) return { items: [], total: 0 };
  
  try {
    const { data } = await http.get<any>(`${BASE_URL}/ProductFilesList`, {
      params: { productsId, page, pageSize },
    });
    return data?.data ?? data; 
    
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { items: [], total: 0, totalPages: 1 };
    }
    throw err;
  }
}

export async function createProductFiles(dto: ProductFileCreateDto) {
  const responses = await Promise.all(
    dto.files.map((fileUrl) =>
      http.post(`${BASE_URL}/ProductFileCreate`, {
        productsId: dto.productsId,
        fileUrl,
        fileTitle: getFileTitle(fileUrl),
        relativePath: toRelativePathFromPublic(fileUrl) ?? "",
      }),
    ),
  );

  return responses.at(-1)?.data ?? { status: 1, message: "Archivos registrados." };
}

export async function deleteProductFile(dto: ProductFileDeleteDto) {
  const { data } = await http.delete(`${BASE_URL}/ProductFileDelete`, {
    data: dto,
  });
  return data;
}
