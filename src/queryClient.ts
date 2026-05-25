// queryClient.ts
import { QueryClient, keepPreviousData } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // evita refetch al volver de otra pestaña
      refetchOnWindowFocus: false,
      // al recuperar conexión, vuelve a intentar
      refetchOnReconnect: true, // ("always" puede no tipar en v5)
      // datos “frescos” por 60s
      staleTime: 60_000,
      // GC a los 10 min
      gcTime: 10 * 60_000,
      // reintentos moderados
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      // 🔁 v5: reemplaza keepPreviousData
      placeholderData: keepPreviousData,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
