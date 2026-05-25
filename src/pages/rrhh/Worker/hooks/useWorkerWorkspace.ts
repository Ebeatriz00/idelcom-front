import { useState } from "react";
import { useDebouncedValue, useWorkerList, useWorkerById } from "@/sharedKernel";

export function useWorkerWorkspace() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  
  // Estado para el panel de detalle
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fetch de la lista paginada y filtrada desde la BD
  const { 
    data: listData, 
    isLoading: isLoadingList, 
    error: listError 
  } = useWorkerList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  // Fetch del detalle individual optimizado
  const { 
    data: selectedDetail, 
    isFetching: isLoadingDetail 
  } = useWorkerById(selectedId);

  // Resetear a la página 0 cuando se busca
  const handleSearch = (val: string) => {
    setSearch(val);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  return {
    pagination,
    setPagination,
    search,
    handleSearch,
    selectedId,
    setSelectedId,
    listData,
    isLoadingList,
    listError,
    selectedDetail,
    isLoadingDetail
  };
}