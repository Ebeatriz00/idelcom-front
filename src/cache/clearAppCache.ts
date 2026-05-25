import { queryClient } from "@/queryClient";

export async function clearAppCache() {
  await queryClient.cancelQueries();
  queryClient.clear();
}
